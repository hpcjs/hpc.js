import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GPUKernelSource, GPUVec3 } from '../common/types';
import {
  CPUBufferCollection,
  CPUTranspiledKernelArgs,
  CPUUniformCollection,
  CPUWalkerState,
} from './types';

const processors = {
  misc: (text: string, state: CPUWalkerState<string, string>) => {
    let match = new RegExp(
      String.raw`^${state.inputsVarName}\[threadId\]\[([xyz])\]$`
    ).exec(text);
    if (match) {
      return {
        processed: `${state.inputsVarName}.threadId.${match[1]}`,
        matched: true,
      };
    }

    match = new RegExp(
      String.raw`^${state.inputsVarName}\[canvas\]\[(width|height|setPixel)\]$`
    ).exec(text);
    if (match) {
      if (!state.canvas) {
        throw new Error('Canvas is not defined');
      }

      switch (match[1]) {
        case 'width':
          return {
            processed: `${state.canvas.width}`,
            matched: true,
          };
        case 'height':
          return {
            processed: `${state.canvas.height}`,
            matched: true,
          };
        case 'setPixel':
          return {
            processed: `${state.inputsVarName}.canvas.setPixel`,
            matched: true,
          };
      }
    }

    match =
      /^Math\[(abs|acos|acosh|asin|asinh|atan|atanh|atan2|ceil|cos|cosh|exp|floor|log|log2|max|min|pow|round|sign|sin|sinh|sqrt|tan|tanh|trunc)\]$/.exec(
        text
      );
    if (match) {
      return { processed: `Math.${match[1]}`, matched: true };
    }

    match = /^Math\[(E|LN2|LN10|LOG2E|LOG10E|PI|SQRT1_2|SQRT2)\]$/.exec(text);
    if (match) {
      return { processed: `Math.${match[1]}`, matched: true };
    }

    match = new RegExp(String.raw`^${state.inputsVarName}\[usingCpu\]$`).exec(
      text
    );
    if (match) {
      return { processed: 'true', matched: true };
    }

    return { processed: text, matched: false };
  },
  sizes: (text: string, state: CPUWalkerState<string, string>) => {
    if (!state.buffers) {
      return { processed: text, matched: false };
    }

    const buffersTerm = Object.keys(state.buffers).join('|');
    const match = new RegExp(
      String.raw`^${state.inputsVarName}\[sizes\]\[(${buffersTerm})\]\[([xyz])\]$`
    ).exec(text);

    if (match) {
      const index = { x: 0, y: 1, z: 2 }[match[2] as keyof GPUVec3];
      if (index >= state.buffers[match[1]].size.length) {
        throw new Error('Invalid buffer size index');
      }

      return {
        processed: `${state.buffers[match[1]].size[index]}`,
        matched: true,
      };
    }

    return { processed: text, matched: false };
  },
  buffer: (text: string, state: CPUWalkerState<string, string>) => {
    const match = new RegExp(
      String.raw`^${state.inputsVarName}\[buffers\]\[([a-zA-Z0-9_]+)\](?:\[(.+?)\])(?:\[(.+?)\])?(?:\[(.+?)\])?$`
    ).exec(text);
    if (match) {
      if (!state.buffers) {
        throw new Error('Invalid buffer name');
      }

      if (!(match[1] in state.buffers)) {
        throw new Error('Invalid buffer name');
      }

      const buffer = state.buffers[match[1]];
      let index = `Math.floor(${match[2]})`;
      if (match[3]) {
        if (buffer.size.length < 2) {
          throw new Error('Invalid buffer size');
        }

        index += ` + Math.floor(${match[3]}) * ${buffer.size[0]}`;
      }
      if (match[4]) {
        if (buffer.size.length < 3) {
          throw new Error('Invalid buffer size');
        }

        index += ` + Math.floor(${match[4]}) * ${buffer.size[0]} * ${buffer.size[1]}`;
      }
      return {
        processed: `${state.inputsVarName}.buffers.${match[1]}.resource[${index}]`,
        matched: true,
      };
    }

    return { processed: text, matched: false };
  },
  uniform: (text: string, state: CPUWalkerState<string, string>) => {
    const match = new RegExp(
      String.raw`^${state.inputsVarName}\[uniforms\]\[([a-zA-Z0-9_]+)\]`
    ).exec(text);
    if (match) {
      if (!state.uniforms) {
        throw new Error('Invalid uniform name');
      }

      if (!(match[1] in state.uniforms)) {
        throw new Error('Invalid uniform name');
      }

      return {
        processed: `${state.inputsVarName}.uniforms.${match[1]}`,
        matched: true,
      };
    }

    return { processed: text, matched: false };
  },
  wrapIfSingleLine(text: string) {
    return text.includes('\n') ? text : `{ ${text}; }`;
  },
};

const handlers = {
  BlockStatement(node: any, state: CPUWalkerState<string, string>, c: any) {
    let statement = '{\n';

    for (const child of node.body) {
      const indent = ' '.repeat(4);

      c(child, state);
      const indented = state.currentExpression
        .split('\n')
        .map(line => `${indent}${line}`)
        .join('\n');
      statement += `${indented};\n`;
    }

    statement += '}';
    state.currentExpression = statement;
  },
  ExpressionStatement(
    node: any,
    state: CPUWalkerState<string, string>,
    c: any
  ) {
    c(node.expression, state);
  },
  AssignmentExpression(
    node: any,
    state: CPUWalkerState<string, string>,
    c: any
  ) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  MemberExpression(node: any, state: CPUWalkerState<string, string>, c: any) {
    let memberExpression = '';

    const parentIsLeftOfMemberExpression =
      state.currentNodeIsLeftOfMemberExpression;

    state.currentNodeIsLeftOfMemberExpression = true;
    c(node.object, state);
    memberExpression += state.currentExpression;

    state.currentNodeIsLeftOfMemberExpression = false;
    c(node.property, state);
    memberExpression += `[${state.currentExpression}]`;

    let anyMatched = false;
    let { processed: processed1, matched: matched1 } = processors.misc(
      memberExpression,
      state
    );
    state.currentExpression = processed1;
    anyMatched ||= matched1;

    let { processed: processed2, matched: matched2 } = processors.uniform(
      state.currentExpression,
      state
    );
    state.currentExpression = processed2;
    anyMatched ||= matched2;

    let { processed: processed3, matched: matched3 } = processors.sizes(
      state.currentExpression,
      state
    );
    state.currentExpression = processed3;
    anyMatched ||= matched3;

    state.currentNodeIsLeftOfMemberExpression = parentIsLeftOfMemberExpression;
    if (!state.currentNodeIsLeftOfMemberExpression) {
      let { processed: processed4, matched: matched4 } = processors.buffer(
        state.currentExpression,
        state
      );
      state.currentExpression = processed4;
      anyMatched ||= matched4;

      if (!anyMatched) {
        let replaced = state.currentExpression;
        while (true) {
          const match = /\[(.+?)\]/.exec(replaced);
          if (!match) {
            break;
          }

          replaced = replaced.replace(match[0], `.${match[1]}`);
        }

        // subtract 1 because function signature takes up the first line
        let lineRange;
        if (node.loc.start.line === node.loc.end.line) {
          lineRange = `line ${node.loc.start.line - 1}`;
        } else {
          lineRange = `lines ${node.loc.start.line - 1}-${
            node.loc.end.line - 1
          }`;
        }

        throw new Error(
          `Invalid expression on kernel ${lineRange}: ${replaced}`
        );
      }
    }
  },
  Identifier(node: any, state: CPUWalkerState<string, string>) {
    state.currentExpression = node.name;
  },
  Literal(node: any, state: CPUWalkerState<string, string>) {
    state.currentExpression = `${node.value}`;
  },
  VariableDeclaration(
    node: any,
    state: CPUWalkerState<string, string>,
    c: any
  ) {
    let declarations = '';

    const kind = node.kind === 'const' ? 'const' : 'let';
    declarations += `${kind} `;

    for (const declaration of node.declarations) {
      c(declaration, state);
      declarations += `${state.currentExpression}, `;
    }

    state.currentExpression = declarations.slice(0, -2);
  },
  VariableDeclarator(node: any, state: CPUWalkerState<string, string>, c: any) {
    let declaration = '';

    c(node.id, state);
    declaration += state.currentExpression;

    c(node.init, state);
    declaration += ` = ${state.currentExpression}`;
    state.currentExpression = declaration;
  },
  ForStatement(node: any, state: CPUWalkerState<string, string>, c: any) {
    let forStatement = '';

    c(node.init, state);
    forStatement += `for (${state.currentExpression}; `;

    c(node.test, state);
    forStatement += `${state.currentExpression}; `;

    c(node.update, state);
    forStatement += `${state.currentExpression}) `;

    c(node.body, state);
    forStatement += processors.wrapIfSingleLine(state.currentExpression);
    state.currentExpression = forStatement;
  },
  BinaryExpression(node: any, state: CPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  UpdateExpression(node: any, state: CPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.argument, state);
    expression += `${state.currentExpression}${node.operator}`;

    state.currentExpression = expression;
  },
  WhileStatement(node: any, state: CPUWalkerState<string, string>, c: any) {
    let whileStatement = '';

    c(node.test, state);
    whileStatement += `while (${state.currentExpression}) `;

    c(node.body, state);
    whileStatement += processors.wrapIfSingleLine(state.currentExpression);
    state.currentExpression = whileStatement;
  },
  IfStatement(node: any, state: CPUWalkerState<string, string>, c: any) {
    let ifStatement = '';

    c(node.test, state);
    ifStatement += `if (${state.currentExpression}) `;

    c(node.consequent, state);
    ifStatement += processors.wrapIfSingleLine(state.currentExpression);

    if (node.alternate) {
      ifStatement += ' else ';
      c(node.alternate, state);
      ifStatement += state.currentExpression;
    }

    state.currentExpression = ifStatement;
  },
  LogicalExpression(node: any, state: CPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.left, state);
    expression += `!!(${state.currentExpression})`;

    c(node.right, state);
    expression += ` ${node.operator} !!(${state.currentExpression})`;
    state.currentExpression = expression;
  },
  ReturnStatement(node: any, state: CPUWalkerState<string, string>, c: any) {
    let returnStatement = 'return';

    if (node.argument) {
      c(node.argument, state);
      returnStatement += ` ${state.currentExpression}`;
    }

    state.currentExpression = returnStatement;
  },
  // when prettier formats the generics here, it breaks
  // the color coding for the rest of the file in my vscode
  // prettier-ignore
  ConditionalExpression(
    node: any, state: CPUWalkerState<string, string>, c: any
  ) {
    let expression = ''

    c(node.test, state)
    expression += `(${state.currentExpression}) ? `

    c(node.consequent, state)
    expression += `${state.currentExpression} : `

    c(node.alternate, state)
    expression += `${state.currentExpression}`

    state.currentExpression = expression
  },
  CallExpression(node: any, state: CPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.callee, state);
    expression += state.currentExpression;

    expression += '(';
    for (const arg of node.arguments) {
      c(arg, state);
      expression += `${state.currentExpression}, `;
    }
    expression = expression.slice(0, -2);
    expression += ')';

    state.currentExpression = expression;
  },
  UnaryExpression(node: any, state: CPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.argument, state);
    expression += `${node.operator}${state.currentExpression}`;

    state.currentExpression = expression;
  },
};

export default function transpileKernelToCPU<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TGPUKernelMiscInfoInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  kernel: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface,
    TGPUKernelMiscInfoInterface
  >,
  gpuBuffers?: CPUBufferCollection<TBufferName>,
  gpuUniforms?: CPUUniformCollection<TUniformName>,
  canvas?: HTMLCanvasElement,
  pixels?: Uint8ClampedArray
) {
  const src = kernel.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022 }) as any;
  const funcBody = ast.body[0].expression.body;
  const inputsVarName = ast.body[0].expression.params[0].name;

  const walkerState = {
    currentExpression: '',
    currentNodeIsLeftOfMemberExpression: false,
    buffers: gpuBuffers,
    uniforms: gpuUniforms,
    inputsVarName,
    canvas,
  } as CPUWalkerState<TBufferName, TUniformName>;
  walk.recursive(funcBody, walkerState, handlers);

  // slice to remove braces
  const transpiledSource = walkerState.currentExpression.slice(2, -2);
  const transpiled = new Function(inputsVarName, transpiledSource);
  console.log(transpiled.toString());

  const run = (x: number, y: number = 1, z: number = 1) => {
    const inputs: CPUTranspiledKernelArgs<TBufferName, TUniformName> = {
      buffers: gpuBuffers,
      uniforms: gpuUniforms,
      threadId: { x: 0, y: 0, z: 0 },
      canvas: canvas
        ? {
            width: canvas.width,
            height: canvas.height,
            setPixel: (
              x: number,
              y: number,
              r: number,
              g: number,
              b: number
            ) => {
              if (!canvas || !pixels) return;

              const index = (x + y * canvas.width) * 4;
              pixels[index + 0] = r;
              pixels[index + 1] = g;
              pixels[index + 2] = b;
              pixels[index + 3] = 255;
            },
          }
        : undefined,
    };

    for (let ix = 0; ix < x; ix++) {
      inputs.threadId.x = ix;

      for (let iy = 0; iy < y; iy++) {
        inputs.threadId.y = iy;

        for (let iz = 0; iz < z; iz++) {
          inputs.threadId.z = iz;

          transpiled(inputs);
        }
      }
    }
  };

  return run;
}
