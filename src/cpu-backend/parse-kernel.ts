import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GPUKernelSource } from '../common/types';
import {
  CPUBufferCollection,
  CPUTranspiledKernelArgs,
  CPUUniformCollection,
  CPUWalkerState,
} from './types';

const processors = {
  threadId: (text: string) => {
    const match = /^inputs\[threadId\]\[([xyz])\]$/.exec(text);
    if (match) {
      return `inputs.threadId.${match[1]}`;
    }

    return text;
  },
  buffer: <TBufferName extends string>(
    text: string,
    gpuBuffers?: CPUBufferCollection<TBufferName>
  ) => {
    const match =
      /^inputs\[buffers\]\[([a-zA-Z0-9_]+)\](?:\[(.+?)\])(?:\[(.+?)\])?(?:\[(.+?)\])?$/.exec(
        text
      );
    if (match) {
      if (!gpuBuffers) {
        throw new Error('Invalid buffer name');
      }

      if (!(match[1] in gpuBuffers)) {
        throw new Error('Invalid buffer name');
      }

      const buffer = gpuBuffers[match[1] as TBufferName];
      let index = `(${match[2]})`;
      if (match[3]) {
        if (buffer.size.length < 2) {
          throw new Error('Invalid buffer size');
        }

        index += ` + (${match[3]}) * ${buffer.size[0]}`;
      }
      if (match[4]) {
        if (buffer.size.length < 3) {
          throw new Error('Invalid buffer size');
        }

        index += ` + (${match[4]}) * ${buffer.size[0]} * ${buffer.size[1]}`;
      }
      return `inputs.buffers.${match[1]}.resource[${index}]`;
    }

    return text;
  },
  gpuUniform: <TUniformName extends string>(
    text: string,
    gpuUniforms?: CPUUniformCollection<TUniformName>
  ) => {
    const match = /^inputs\[uniforms\]\[([a-zA-Z0-9_]+)\]/.exec(text);
    if (match) {
      if (!gpuUniforms) {
        throw new Error('Invalid uniform name');
      }

      if (!(match[1] in gpuUniforms)) {
        throw new Error('Invalid uniform name');
      }

      return `inputs.uniforms.${match[1]}`;
    }

    return text;
  },
  wrapIfSingleLine(text: string) {
    return text.includes('\n') ? text : `{ ${text}; }`;
  },
  func: (text: string) => {
    const match = /^inputs\[funcs\]\[([a-zA-Z0-9_]+)\]$/.exec(text);
    if (match) {
      if (!['setPixel'].includes(match[1])) {
        throw new Error('Invalid function name');
      }

      return `inputs.funcs.${match[1]}`;
    }

    return text;
  },
};

const handlers = {
  BlockStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
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
  ExpressionStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    c(node.expression, state);
  },
  AssignmentExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  MemberExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let memberExpression = '';

    state.memberExpressionDepth++;
    c(node.object, state);
    memberExpression += state.currentExpression;
    state.memberExpressionDepth--;

    c(node.property, state);
    memberExpression += `[${state.currentExpression}]`;
    state.currentExpression = processors.gpuUniform(
      memberExpression,
      state.uniforms
    );
    state.currentExpression = processors.threadId(state.currentExpression);
    state.currentExpression = processors.func(state.currentExpression);
    if (state.memberExpressionDepth === 0) {
      state.currentExpression = processors.buffer(
        state.currentExpression,
        state.buffers
      );
    }
  },
  Identifier<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>
  ) {
    state.currentExpression = node.name;
  },
  Literal<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>
  ) {
    state.currentExpression = `${node.value}`;
  },
  VariableDeclaration<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
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
  VariableDeclarator<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let declaration = '';

    c(node.id, state);
    declaration += state.currentExpression;

    c(node.init, state);
    declaration += ` = ${state.currentExpression}`;
    state.currentExpression = declaration;
  },
  ForStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
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
  BinaryExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  UpdateExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let expression = '';

    c(node.argument, state);
    expression += state.currentExpression;

    expression += node.operator;

    state.currentExpression = expression;
  },
  WhileStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let whileStatement = '';

    c(node.test, state);
    whileStatement += `while (${state.currentExpression}) `;

    c(node.body, state);
    whileStatement += processors.wrapIfSingleLine(state.currentExpression);
    state.currentExpression = whileStatement;
  },
  IfStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
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
  LogicalExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let expression = '';

    c(node.left, state);
    expression += `bool(${state.currentExpression})`;

    c(node.right, state);
    expression += ` ${node.operator} bool(${state.currentExpression})`;
    state.currentExpression = expression;
  },
  ReturnStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
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
  ConditionalExpression<TBufferName extends string, TUniformName extends string>(
    node: any, state: CPUWalkerState<TBufferName, TUniformName>, c: any
  ) {
    let expression = '';

    c(node.test, state);
    expression += `bool(${state.currentExpression}) ? `;

    c(node.consequent, state);
    expression += `${state.currentExpression} : `;

    c(node.alternate, state);
    expression += `${state.currentExpression}`;

    state.currentExpression = expression;
  },
  CallExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: CPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
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
};

export default function transpileKernelToCPU<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  kernel: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface
  >,
  gpuBuffers?: CPUBufferCollection<TBufferName>,
  gpuUniforms?: CPUUniformCollection<TUniformName>,
  canvas?: HTMLCanvasElement,
  pixels?: Uint8ClampedArray
) {
  const src = kernel.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022 }) as any;
  const funcBody = ast.body[0].expression.body;

  const walkerState = {
    currentExpression: '',
    memberExpressionDepth: 0,
    buffers: gpuBuffers,
    uniforms: gpuUniforms,
  } as CPUWalkerState<TBufferName, TUniformName>;
  walk.recursive(funcBody, walkerState, handlers);

  // slice to remove braces
  const transpiledSource = walkerState.currentExpression.slice(2, -2);
  const transpiled = new Function('inputs', transpiledSource);
  console.log(transpiled.toString());

  const run = (x: number, y: number = 1, z: number = 1) => {
    const inputs: CPUTranspiledKernelArgs<TBufferName, TUniformName> = {
      buffers: gpuBuffers,
      uniforms: gpuUniforms,
      threadId: { x: 0, y: 0, z: 0 },
      funcs: {
        setPixel: (x: number, y: number, r: number, g: number, b: number) => {
          if (!canvas || !pixels) return;

          const index = (x + y * canvas.width) * 4;
          pixels[index + 0] = r;
          pixels[index + 1] = g;
          pixels[index + 2] = b;
          pixels[index + 3] = 255;
        },
      },
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
