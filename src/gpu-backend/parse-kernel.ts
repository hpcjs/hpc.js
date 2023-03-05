import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GPUKernelSource, GPUVec3 } from '../common/types';
import {
  GPUBufferCollection,
  GPUUniformCollection,
  GPUWalkerState,
} from './types';
import { getSetPixelSource } from './wgsl-code';

const processors = {
  misc: (text: string, state: GPUWalkerState<string, string>) => {
    let match = new RegExp(
      String.raw`^${state.inputsVarName}\[threadId\]\[([xyz])\]$`
    ).exec(text);
    if (match) {
      return { processed: `f32(global_id.${match[1]})`, matched: true };
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
            processed: 'setPixel',
            matched: true,
          };
      }
    }

    match =
      /^Math\[(abs|acos|acosh|asin|asinh|atan|atanh|atan2|ceil|cos|cosh|exp|floor|log|log2|max|min|pow|round|sign|sin|sinh|sqrt|tan|tanh|trunc)\]$/.exec(
        text
      );
    if (match) {
      return { processed: match[1], matched: true };
    }

    match = /^Math\[(E|LN2|LN10|LOG2E|LOG10E|PI|SQRT1_2|SQRT2)\]$/.exec(text);
    if (match) {
      const value = Math[match[1] as keyof Math];
      return { processed: `f32(${value})`, matched: true };
    }

    match = new RegExp(String.raw`^${state.inputsVarName}\[usingCpu\]$`).exec(
      text
    );
    if (match) {
      return { processed: 'false', matched: true };
    }

    return { processed: text, matched: false };
  },
  sizes: (text: string, state: GPUWalkerState<string, string>) => {
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
  buffer: (text: string, state: GPUWalkerState<string, string>) => {
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
      let index = `i32(${match[2]})`;
      if (match[3]) {
        if (buffer.size.length < 2) {
          throw new Error('Invalid buffer size');
        }

        index += ` + i32(${match[3]}) * ${buffer.size[0]}`;
      }
      if (match[4]) {
        if (buffer.size.length < 3) {
          throw new Error('Invalid buffer size');
        }

        index += ` + i32(${match[4]}) * ${buffer.size[0]} * ${buffer.size[1]}`;
      }
      return { processed: `data_${match[1]}.data[${index}]`, matched: true };
    }

    return { processed: text, matched: false };
  },
  uniform: (text: string, state: GPUWalkerState<string, string>) => {
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

      return { processed: `uniforms.${match[1]}`, matched: true };
    }

    return { processed: text, matched: false };
  },
  wrapIfSingleLine(text: string) {
    return text.includes('\n') ? text : `{ ${text}; }`;
  },
};

const handlers = {
  BlockStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
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
    state: GPUWalkerState<string, string>,
    c: any
  ) {
    c(node.expression, state);
  },
  AssignmentExpression(
    node: any,
    state: GPUWalkerState<string, string>,
    c: any
  ) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} f32(${state.currentExpression})`;
    state.currentExpression = expression;
  },
  MemberExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
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
  Identifier(node: any, state: GPUWalkerState<string, string>) {
    state.currentExpression = node.name;
  },
  Literal(node: any, state: GPUWalkerState<string, string>) {
    state.currentExpression = `${node.value}`;
  },
  VariableDeclaration(
    node: any,
    state: GPUWalkerState<string, string>,
    c: any
  ) {
    let declarations = '';

    const kind = node.kind === 'const' ? 'let' : 'var';
    declarations += `${kind} `;

    for (const declaration of node.declarations) {
      c(declaration, state);
      declarations += `${state.currentExpression}, `;
    }

    state.currentExpression = declarations.slice(0, -2);
  },
  VariableDeclarator(node: any, state: GPUWalkerState<string, string>, c: any) {
    let declaration = '';

    c(node.id, state);
    declaration += state.currentExpression;

    c(node.init, state);
    declaration += `: f32 = f32(${state.currentExpression})`;
    state.currentExpression = declaration;
  },
  ForStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
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
  BinaryExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    let expression = '';
    const operator = node.operator === '===' ? '==' : node.operator;

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  UpdateExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.argument, state);
    expression += state.currentExpression;

    if (node.operator === '++') {
      expression += ' += 1.0';
    } else if (node.operator === '--') {
      expression += ' -= 1.0';
    }

    state.currentExpression = expression;
  },
  WhileStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
    let whileStatement = '';

    c(node.test, state);
    whileStatement += `while (${state.currentExpression}) `;

    c(node.body, state);
    whileStatement += processors.wrapIfSingleLine(state.currentExpression);
    state.currentExpression = whileStatement;
  },
  IfStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
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
  LogicalExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.left, state);
    expression += `bool(${state.currentExpression})`;

    c(node.right, state);
    expression += ` ${node.operator} bool(${state.currentExpression})`;
    state.currentExpression = expression;
  },
  ReturnStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
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
    node: any, state: GPUWalkerState<string, string>, c: any
  ) {
    let expression = 'select(';

    c(node.alternate, state);
    expression += `${state.currentExpression}, `;

    c(node.consequent, state);
    expression += `${state.currentExpression}, `;

    c(node.test, state);
    expression += `${state.currentExpression})`;

    state.currentExpression = expression;
  },
  CallExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
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
  UnaryExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    let expression = '';

    c(node.argument, state);
    expression += `${node.operator}${state.currentExpression}`;

    state.currentExpression = expression;
  },
};

export default function transpileKernelToGPU<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TGPUKernelMiscInfoInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  func: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface,
    TGPUKernelMiscInfoInterface
  >,
  buffers?: GPUBufferCollection<TBufferName>,
  uniforms?: GPUUniformCollection<TUniformName>,
  canvas?: HTMLCanvasElement
) {
  const src = func.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022, locations: true }) as any;
  const funcBody = ast.body[0].expression.body;
  const inputsVarName = ast.body[0].expression.params[0].name;

  let wgsl = '';

  if (buffers) {
    wgsl += 'struct Data {\n    data: array<f32>\n}\n\n';
    for (const name in buffers) {
      wgsl += `@group(0) @binding(${buffers[name].id}) var<storage, read_write> data_${name}: Data;\n`;
    }
    wgsl += '\n';
  }

  if (uniforms) {
    wgsl += 'struct Uniforms {\n';
    for (const name in uniforms) {
      wgsl += `    ${name}: f32,\n`;
    }

    wgsl += `}\n\n@group(0) @binding(${
      buffers ? Object.keys(buffers).length : 0
    }) var<uniform> uniforms: Uniforms;\n\n`;
  }

  if (canvas) {
    wgsl += `struct PixelData {\n    data: array<vec3<f32>>\n}\n\n`;

    wgsl += `@group(0) @binding(${
      (buffers ? Object.keys(buffers).length : 0) + (uniforms ? 1 : 0)
    }) var<storage, read_write> pixels: PixelData;\n\n`;

    wgsl += `${getSetPixelSource(canvas.width)}\n\n`;
  }

  wgsl +=
    '@compute @workgroup_size(1, 1)\nfn main(@builtin(global_invocation_id) global_id: vec3<u32>) ';

  const walkerState = {
    currentExpression: '',
    currentNodeIsLeftOfMemberExpression: false,
    buffers,
    uniforms,
    inputsVarName,
    canvas,
  } as GPUWalkerState<TBufferName, TUniformName>;
  walk.recursive(funcBody, walkerState, handlers);
  wgsl += walkerState.currentExpression;
  console.log(wgsl);

  return wgsl;
}
