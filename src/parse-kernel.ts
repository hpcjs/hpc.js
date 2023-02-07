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
  gpuBuffer: (text: string, gpuBuffers: GPUBufferCollection) => {
    const match =
      /^inputs\[buffers\]\[([a-zA-Z0-9_]+)\](?:\[(.+?)\])(?:\[(.+?)\])?(?:\[(.+?)\])?$/.exec(
        text
      );
    if (match) {
      if (!gpuBuffers[match[1]]) {
        throw new Error('Invalid buffer name');
      }

      const buffer = gpuBuffers[match[1]];
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
};

const handlers = {
  BlockStatement(node: any, state: WalkerState, c: any) {
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
  ExpressionStatement(node: any, state: WalkerState, c: any) {
    c(node.expression, state);
  },
  AssignmentExpression(node: any, state: WalkerState, c: any) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  MemberExpression(node: any, state: WalkerState, c: any) {
    let memberExpression = '';

    state.memberExpressionDepth++;
    c(node.object, state);
    memberExpression += state.currentExpression;
    state.memberExpressionDepth--;

    c(node.property, state);
    memberExpression += `[${state.currentExpression}]`;
    state.currentExpression = processors.threadId(memberExpression);
    if (state.memberExpressionDepth === 0) {
      state.currentExpression = processors.gpuBuffer(
        state.currentExpression,
        state.gpuBuffers
      );
    }
  },
  Identifier(node: any, state: WalkerState) {
    state.currentExpression = node.name;
  },
  Literal(node: any, state: WalkerState) {
    state.currentExpression = `${node.value}`;
  },
  VariableDeclaration(node: any, state: WalkerState, c: any) {
    let declarations = '';

    const kind = node.kind === 'const' ? 'let' : 'var';
    declarations += `${kind} `;

    for (const declaration of node.declarations) {
      c(declaration, state);
      declarations += `${state.currentExpression}, `;
    }

    state.currentExpression = declarations.slice(0, -2);
  },
  VariableDeclarator(node: any, state: WalkerState, c: any) {
    let declaration = '';

    c(node.id, state);
    declaration += state.currentExpression;

    c(node.init, state);
    declaration += `: f32 = ${state.currentExpression}`;
    state.currentExpression = declaration;
  },
  ForStatement(node: any, state: WalkerState, c: any) {
    let forStatement = '';

    c(node.init, state);
    forStatement += `for (${state.currentExpression}; `;

    c(node.test, state);
    forStatement += `${state.currentExpression}; `;

    c(node.update, state);
    forStatement += `${state.currentExpression}) `;

    c(node.body, state);
    forStatement += `${state.currentExpression}`;
    state.currentExpression = forStatement;
  },
  BinaryExpression(node: any, state: WalkerState, c: any) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  UpdateExpression(node: any, state: WalkerState, c: any) {
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
  WhileStatement(node: any, state: WalkerState, c: any) {
    let whileStatement = '';

    c(node.test, state);
    whileStatement += `while (${state.currentExpression}) `;

    c(node.body, state);
    whileStatement += `${state.currentExpression}`;
    state.currentExpression = whileStatement;
  },
  IfStatement(node: any, state: WalkerState, c: any) {
    let ifStatement = '';

    c(node.test, state);
    ifStatement += `if (${state.currentExpression}) `;

    c(node.consequent, state);
    ifStatement += `${state.currentExpression}`;

    if (node.alternate) {
      ifStatement += ' else ';
      c(node.alternate, state);
      ifStatement += state.currentExpression;
    }

    state.currentExpression = ifStatement;
  },
};

export default function parseKernel<TGPUKernelBuffersInterface>(
  func: GPUKernelSource<TGPUKernelBuffersInterface>,
  gpuBuffers: GPUBufferCollection
) {
  const src = func.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022 }) as any;
  const funcBody = ast.body[0].expression.body;

  let wgsl = 'struct Data {\n  data : array<f32>\n}\n\n';
  for (const name in gpuBuffers) {
    wgsl += `@group(0) @binding(${gpuBuffers[name].id}) var<storage, read_write> data_${name} : Data;\n`;
  }

  wgsl +=
    '\n@compute @workgroup_size(1, 1)\nfn main(@builtin(global_invocation_id) global_id : vec3<u32>) ';

  const walkerState: WalkerState = {
    currentExpression: '',
    memberExpressionDepth: 0,
    gpuBuffers,
  };
  walk.recursive(funcBody, walkerState, handlers);
  wgsl += walkerState.currentExpression;
  console.log(wgsl);

  return wgsl;
}
