import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GPUKernelSource } from '../common/types';
import {
  GPUBufferCollection,
  GPUUniformCollection,
  GPUWalkerState,
} from './types';
import { getSetPixelSource } from './wgsl-code';

const processors = {
  misc: (text: string) => {
    let match = /^inputs\[threadId\]\[([xyz])\]$/.exec(text);
    if (match) {
      return { processed: `f32(global_id.${match[1]})`, matched: true };
    }

    match = /^inputs\[funcs\]\[(setPixel)\]$/.exec(text);
    if (match) {
      return { processed: match[1], matched: true };
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

    return { processed: text, matched: false };
  },
  buffer: <TBufferName extends string>(
    text: string,
    buffers?: GPUBufferCollection<TBufferName>
  ) => {
    const match =
      /^inputs\[buffers\]\[([a-zA-Z0-9_]+)\](?:\[(.+?)\])(?:\[(.+?)\])?(?:\[(.+?)\])?$/.exec(
        text
      );
    if (match) {
      if (!buffers) {
        throw new Error('Invalid buffer name');
      }

      if (!(match[1] in buffers)) {
        throw new Error('Invalid buffer name');
      }

      const buffer = buffers[match[1] as TBufferName];
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
  uniform: <TUniformName extends string>(
    text: string,
    uniforms?: GPUUniformCollection<TUniformName>
  ) => {
    const match = /^inputs\[uniforms\]\[([a-zA-Z0-9_]+)\]/.exec(text);
    if (match) {
      if (!uniforms) {
        throw new Error('Invalid uniform name');
      }

      if (!(match[1] in uniforms)) {
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
  BlockStatement<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
    c(node.expression, state);
  },
  AssignmentExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
    c: any
  ) {
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
    let { processed: processed1, matched: matched1 } =
      processors.misc(memberExpression);
    state.currentExpression = processed1;
    anyMatched ||= matched1;

    let { processed: processed2, matched: matched2 } = processors.uniform(
      state.currentExpression,
      state.uniforms
    );
    state.currentExpression = processed2;
    anyMatched ||= matched2;

    state.currentNodeIsLeftOfMemberExpression = parentIsLeftOfMemberExpression;
    if (!state.currentNodeIsLeftOfMemberExpression) {
      let { processed: processed3, matched: matched3 } = processors.buffer(
        state.currentExpression,
        state.buffers
      );
      state.currentExpression = processed3;
      anyMatched ||= matched3;

      if (!anyMatched) {
        throw new Error('Invalid expression');
      }
    }
  },
  Identifier<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: GPUWalkerState<TBufferName, TUniformName>
  ) {
    state.currentExpression = node.name;
  },
  Literal<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: GPUWalkerState<TBufferName, TUniformName>
  ) {
    state.currentExpression = `${node.value}`;
  },
  VariableDeclaration<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    state: GPUWalkerState<TBufferName, TUniformName>,
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
    node: any, state: GPUWalkerState<TBufferName, TUniformName>, c: any
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
  CallExpression<TBufferName extends string, TUniformName extends string>(
    node: any,
    state: GPUWalkerState<TBufferName, TUniformName>,
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

export default function transpileKernelToGPU<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  func: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface
  >,
  buffers?: GPUBufferCollection<TBufferName>,
  uniforms?: GPUUniformCollection<TUniformName>,
  canvas?: HTMLCanvasElement
) {
  const src = func.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022 }) as any;
  const funcBody = ast.body[0].expression.body;

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
  } as GPUWalkerState<TBufferName, TUniformName>;
  walk.recursive(funcBody, walkerState, handlers);
  wgsl += walkerState.currentExpression;
  console.log(wgsl);

  return wgsl;
}
