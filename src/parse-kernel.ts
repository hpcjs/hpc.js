import {
  GPUBufferCollection,
  GPUUniformCollection,
  WalkerState,
} from './internal-types';
import { GPUKernelSource } from './types';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { getSetPixelSource } from './wgsl-code';

const processors = {
  threadId: (text: string) => {
    const match = /^inputs\[threadId\]\[([xyz])\]$/.exec(text);
    if (match) {
      return `f32(global_id.${match[1]})`;
    }

    return text;
  },
  gpuBuffer: <TBufferName extends string>(
    text: string,
    gpuBuffers: GPUBufferCollection<TBufferName>
  ) => {
    const match =
      /^inputs\[buffers\]\[([a-zA-Z0-9_]+)\](?:\[(.+?)\])(?:\[(.+?)\])?(?:\[(.+?)\])?$/.exec(
        text
      );
    if (match) {
      if (!(match[1] in gpuBuffers)) {
        throw new Error('Invalid buffer name');
      }

      const buffer = gpuBuffers[match[1] as TBufferName];
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
      return `data_${match[1]}.data[${index}]`;
    }

    return text;
  },
  gpuUniform: <TUniformName extends string>(
    text: string,
    gpuUniforms: GPUUniformCollection<TUniformName>
  ) => {
    const match = /^inputs\[uniforms\]\[([a-zA-Z0-9_]+)\]/.exec(text);
    if (match) {
      if (!(match[1] in gpuUniforms)) {
        throw new Error('Invalid uniform name');
      }

      return `uniforms.${match[1]}`;
    }

    return text;
  },
  wrapIfSingleLine(text: string) {
    return text.includes('\n') ? text : `{ ${text}; }`;
  },
  gpuFunction: (text: string) => {
    const match = /^inputs\[funcs\]\[([a-zA-Z0-9_]+)\]$/.exec(text);
    if (match) {
      if (!['setPixel'].includes(match[1])) {
        throw new Error('Invalid function name');
      }

      return match[1];
    }

    return text;
  },
};

const handlers = {
  BlockStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
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
    state: WalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    c(node.expression, state);
  },
  AssignmentExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} f32(${state.currentExpression})`;
    state.currentExpression = expression;
  },
  MemberExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let memberExpression = '';

    state.memberExpressionDepth++;
    c(node.object, state);
    memberExpression += state.currentExpression;
    state.memberExpressionDepth--;

    c(node.property, state);
    memberExpression += `[${state.currentExpression}]`;
    state.currentExpression = processors.threadId(memberExpression);
    state.currentExpression = processors.gpuFunction(state.currentExpression);
    state.currentExpression = processors.gpuUniform(
      state.currentExpression,
      state.gpuUniforms
    );
    if (state.memberExpressionDepth === 0) {
      state.currentExpression = processors.gpuBuffer(
        state.currentExpression,
        state.gpuBuffers
      );
    }
  },
  Identifier<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>
  ) {
    state.currentExpression = node.name;
  },
  Literal<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>
  ) {
    state.currentExpression = `${node.value}`;
  },
  VariableDeclaration<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
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
  VariableDeclarator<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let declaration = '';

    c(node.id, state);
    declaration += state.currentExpression;

    c(node.init, state);
    declaration += `: f32 = f32(${state.currentExpression})`;
    state.currentExpression = declaration;
  },
  ForStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
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
    state: WalkerState<TBufferName, TUniformName>,
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
    state: WalkerState<TBufferName, TUniformName>,
    c: any
  ) {
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
  WhileStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
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
    state: WalkerState<TBufferName, TUniformName>,
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
    state: WalkerState<TBufferName, TUniformName>,
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
    state: WalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    let returnStatement = 'return';

    if (node.argument) {
      c(node.argument, state);
      returnStatement += ` ${state.currentExpression}`;
    }

    state.currentExpression = returnStatement;
  },
  ConditionalExpression<
    TBufferName extends string,
    TUniformName extends string
  >(node: any, state: WalkerState<TBufferName, TUniformName>, c: any) {
    let expression = 'select(';

    c(node.alternate, state);
    expression += `${state.currentExpression}, `;

    c(node.consequent, state);
    expression += `${state.currentExpression}, `;

    c(node.test, state);
    expression += `${state.currentExpression})`;

    state.currentExpression = expression;
  },
  CallExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: WalkerState<TBufferName, TUniformName>,
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

export default function parseKernel<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  func: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface
  >,
  gpuBuffers: GPUBufferCollection<TBufferName>,
  gpuUniforms: GPUUniformCollection<TUniformName>,
  canvasSize?: [number, number]
) {
  const src = func.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022 }) as any;
  const funcBody = ast.body[0].expression.body;

  let wgsl = 'struct Data {\n    data: array<f32>\n}\n\n';
  wgsl += `struct PixelData {\n    data: array<vec3<f32>>\n}\n\n`;
  wgsl += 'struct Uniforms {\n';

  for (const name in gpuUniforms) {
    wgsl += `    ${name}: f32,\n`;
  }
  wgsl += '}\n\n';
  for (const name in gpuBuffers) {
    wgsl += `@group(0) @binding(${gpuBuffers[name].id}) var<storage, read_write> data_${name}: Data;\n`;
  }
  wgsl += `@group(0) @binding(${
    Object.keys(gpuBuffers).length
  }) var<uniform> uniforms: Uniforms;\n`;
  wgsl += `@group(0) @binding(${
    Object.keys(gpuBuffers).length + 1
  }) var<storage, read_write> pixels: PixelData;\n\n`;

  if (canvasSize) {
    wgsl += `${getSetPixelSource(canvasSize[0], canvasSize[1])}\n\n`;
  }

  wgsl +=
    '@compute @workgroup_size(1, 1)\nfn main(@builtin(global_invocation_id) global_id: vec3<u32>) ';

  const walkerState = {
    currentExpression: '',
    memberExpressionDepth: 0,
    gpuBuffers,
    gpuUniforms,
  };
  walk.recursive(funcBody, walkerState, handlers);
  wgsl += walkerState.currentExpression;
  console.log(wgsl);

  return wgsl;
}
