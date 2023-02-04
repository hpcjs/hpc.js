import { GPUBufferCollection, WalkerState } from './internal-types';
import { GPUKernelSource } from './types';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const processors = {
  threadId: (text: string) => {
    const match = /^inputs\[threadId\]\[([xyz])\]$/.exec(text);
    if (match) {
      return `global_id.${match[1]}`;
    }

    return text;
  },
  gpuBuffer: (text: string) => {
    const match = /^inputs\[buffers\]\[([a-zA-Z0-9_]+)\]$/.exec(text);
    if (match) {
      return `data_${match[1]}.data`;
    }

    return text;
  },
};

const handlers = {
  ExpressionStatement(node: any, state: WalkerState, c: any) {
    c(node.expression, state);
  },
  AssignmentExpression(node: any, state: WalkerState, c: any) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;
    state.currentExpression = '';

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  MemberExpression(node: any, state: WalkerState, c: any) {
    let memberExpression = '';

    c(node.object, state);
    memberExpression += state.currentExpression;
    state.currentExpression = '';

    c(node.property, state);
    memberExpression += `[${state.currentExpression}]`;
    state.currentExpression = processors.threadId(memberExpression);
    state.currentExpression = processors.gpuBuffer(state.currentExpression);
  },
  Identifier(node: any, state: WalkerState) {
    state.currentExpression = node.name;
  },
  Literal(node: any, state: WalkerState) {
    state.currentExpression = `${node.value}`;
  },
};

export default function parseKernel(
  func: GPUKernelSource,
  gpuBuffers: GPUBufferCollection
) {
  const src = func.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022 }) as any;
  const funcBody = ast.body[0].expression.body.body;

  let wgsl = 'struct Data {\n  data : array<f32>\n}\n\n';
  for (const name in gpuBuffers) {
    wgsl += `@group(0) @binding(${gpuBuffers[name].id}) var<storage, read_write> data_${name} : Data;\n`;
  }

  wgsl +=
    '\n@compute @workgroup_size(1, 1)\nfn main(@builtin(global_invocation_id) global_id : vec3<u32>) {\n';

  const walkerState: WalkerState = { currentExpression: '' };
  for (const node of funcBody) {
    walk.recursive(node, walkerState, handlers);
    wgsl += `${walkerState.currentExpression};\n`;
  }

  wgsl += '}';
  console.log(wgsl);
  return wgsl;
}
