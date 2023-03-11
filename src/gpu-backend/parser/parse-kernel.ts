import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GPUKernelSource } from '../../common/types';
import { tsToWgslType } from '../../common/utils';
import functions from './functions';
import {
  GPUBufferCollection,
  GPUExpressionWithType,
  GPUUniformCollection,
  GPUWalkerState,
} from '../types';
import { getSetPixelSource } from '../wgsl-code';
import {
  processArrayAccess,
  processExpressionFields,
  processFunction,
  processSpecialVariable,
  wrapIfSingleLine,
} from './processors';

// required since minification turns vec3
// into  __WEBPACK_IMPORTED_MODULE__.vec3
const memberExpressionSkipTriggers = ['vec2', 'vec3', 'vec4', 'array'];

const handlers = {
  BlockStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
    let statement = '{\n';

    if (!state.addedPrelude) {
      statement += '    let global_id = vec3<f32>(global_id_u32);\n';
      state.addedPrelude = true;
    }

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
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;
  },
  MemberExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    // solves minification issues
    if (
      node.property.type === 'Identifier' &&
      memberExpressionSkipTriggers.includes(node.property.name)
    ) {
      state.currentExpression = node.property.name;
      state.expressionType = 'function';
      return;
    }

    c(node.object, state);
    const memberExpressionParentName = state.currentExpression;
    const memberExpressionParentType = state.expressionType;

    const arrayTypes = [
      'numberarray',
      'vec2array',
      'vec3array',
      'vec4array',
      'booleanarray',
    ];

    // false if array access
    state.skipIdentifier = !arrayTypes.includes(memberExpressionParentType);
    c(node.property, state);
    state.skipIdentifier = false;

    state.memberExpressionParentName = memberExpressionParentName;
    state.memberExpressionParentType = memberExpressionParentType;
    state.memberExpressionChildName = state.currentExpression;
    state.memberExpressionChildType = state.expressionType;

    state.expressionType = 'unknown';
    processExpressionFields(state);
    if (state.expressionType !== 'unknown') {
      return;
    }

    processArrayAccess(state);
    if (state.expressionType !== 'unknown') {
      return;
    }

    state.currentExpression = `${state.memberExpressionParentName}[${state.memberExpressionChildName}]`;
    processSpecialVariable(state);

    if (state.expressionType === 'unknown') {
      throw new Error(
        `Unknown property ${state.memberExpressionParentType}.${state.memberExpressionChildName}`
      );
    }
  },
  Identifier(node: any, state: GPUWalkerState<string, string>) {
    state.currentExpression = node.name;

    // skip identifiers that are part of member expressions
    // or variable declarations
    if (state.skipIdentifier) {
      return;
    }

    if (node.name in state.variableTypes) {
      state.expressionType = state.variableTypes[node.name];
      return;
    }

    if (node.name in functions.standalone) {
      state.expressionType = 'unknown';
      return;
    }

    throw new Error(`Unknown variable ${node.name}`);
  },
  Literal(node: any, state: GPUWalkerState<string, string>) {
    state.currentExpression = `${node.value}`;
    state.expressionType = 'number';
  },
  VariableDeclaration(
    node: any,
    state: GPUWalkerState<string, string>,
    c: any
  ) {
    let declarations = '';

    const kind = node.kind === 'const' ? 'let' : 'var';

    for (const declaration of node.declarations) {
      c(declaration, state);
      declarations += `${kind} ${state.currentExpression};\n`;
    }

    state.currentExpression = declarations.slice(0, -2);
  },
  VariableDeclarator(node: any, state: GPUWalkerState<string, string>, c: any) {
    let declaration = '';

    state.skipIdentifier = true;
    c(node.id, state);
    state.skipIdentifier = false;
    declaration += state.currentExpression;

    c(node.init, state);
    state.variableTypes[node.id.name] = state.expressionType;
    // const varType = tsToWgslType(state.expressionType);
    const explicitType = state.expressionType === 'number' ? ': f32' : '';

    declaration += `${explicitType} = ${state.currentExpression}`;
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
    forStatement += wrapIfSingleLine(state.currentExpression);
    state.currentExpression = forStatement;
  },
  BinaryExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    c(node.left, state);
    const var1 = state.currentExpression;
    const type1 = state.expressionType;

    c(node.right, state);
    const var2 = state.currentExpression;
    const type2 = state.expressionType;

    processFunction(
      node.operator,
      null,
      [
        { name: var1, type: type1 },
        { name: var2, type: type2 },
      ],
      state
    );
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
    whileStatement += wrapIfSingleLine(state.currentExpression);
    state.currentExpression = whileStatement;
  },
  IfStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
    let ifStatement = '';

    c(node.test, state);
    ifStatement += `if (${state.currentExpression}) `;

    c(node.consequent, state);
    ifStatement += wrapIfSingleLine(state.currentExpression);

    if (node.alternate) {
      ifStatement += ' else ';
      c(node.alternate, state);
      ifStatement += state.currentExpression;
    }

    state.currentExpression = ifStatement;
  },
  LogicalExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    c(node.left, state);
    const var1 = state.currentExpression;
    const type1 = state.expressionType;

    c(node.right, state);
    const var2 = state.currentExpression;
    const type2 = state.expressionType;

    processFunction(
      node.operator,
      null,
      [
        { name: var1, type: type1 },
        { name: var2, type: type2 },
      ],
      state
    );
  },
  ReturnStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
    let returnStatement = 'return';

    if (node.argument) {
      c(node.argument, state);
      returnStatement += ` ${state.currentExpression}`;
    }

    state.currentExpression = returnStatement;
  },
  ConditionalExpression(
    node: any,
    state: GPUWalkerState<string, string>,
    c: any
  ) {
    c(node.test, state);
    const var1 = state.currentExpression;
    const type1 = state.expressionType;

    c(node.consequent, state);
    const var2 = state.currentExpression;
    const type2 = state.expressionType;

    c(node.alternate, state);
    const var3 = state.currentExpression;
    const type3 = state.expressionType;

    processFunction(
      '?:',
      null,
      [
        { name: var1, type: type1 },
        { name: var2, type: type2 },
        { name: var3, type: type3 },
      ],
      state
    );
  },
  CallExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    const args: GPUExpressionWithType[] = [];
    for (const arg of node.arguments) {
      c(arg, state);
      args.push({ name: state.currentExpression, type: state.expressionType });
    }

    c(node.callee, state);

    const calleeIsMemberExpression = node.callee.type === 'MemberExpression';
    if (calleeIsMemberExpression) {
      processFunction(
        state.memberExpressionChildName,
        {
          name: state.memberExpressionParentName,
          type: state.memberExpressionParentType,
        },
        args,
        state
      );
    } else {
      processFunction(state.currentExpression, null, args, state);
    }
  },
  UnaryExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    c(node.argument, state);
    const var1 = state.currentExpression;
    const type1 = state.expressionType;

    processFunction(node.operator, null, [{ name: var1, type: type1 }], state);
  },
  ArrayExpression(node: any, state: GPUWalkerState<string, string>, c: any) {
    if (state.insideArrayLiteral) {
      throw new Error('Nested array literals are not allowed');
    }

    state.insideArrayLiteral = true;

    const expressions: string[] = [];

    let type = null;
    for (const element of node.elements) {
      c(element, state);
      expressions.push(state.currentExpression);
      if (type === null) {
        type = state.expressionType;

        const allowedTypes = ['number', 'vec2', 'vec3', 'vec4', 'boolean'];
        if (!allowedTypes.includes(type)) {
          throw new Error(
            `Array elements must be of type number, vec2, vec3, vec4 or boolean, but found ${type}`
          );
        }
      } else if (type !== state.expressionType) {
        throw new Error(
          `Array elements must all be of the same type, but found ${type} and ${state.expressionType}`
        );
      }
    }

    state.currentExpression = `${expressions.join(', ')}`;
    state.expressionType = (state.expressionType + 'arrayliteral') as any;
    state.insideArrayLiteral = false;
  },
  BreakStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
    state.currentExpression = 'break';
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
    '@compute @workgroup_size(1, 1)\nfn main(@builtin(global_invocation_id) global_id_u32: vec3<u32>) ';

  const walkerState = {
    currentExpression: '',
    currentNodeIsLeftOfMemberExpression: false,
    buffers,
    uniforms,
    inputsVarName,
    canvas,
    expressionType: 'unknown',
    variableTypes: {
      Math: 'math',
      [inputsVarName]: 'unknown',
    },
    skipIdentifier: false,
    memberExpressionParentName: '',
    memberExpressionParentType: 'unknown',
    memberExpressionChildName: '',
    memberExpressionChildType: 'unknown',
    insideArrayLiteral: false,
    addedPrelude: false,
  } as GPUWalkerState<TBufferName, TUniformName>;
  walk.recursive(funcBody, walkerState, handlers);
  wgsl += walkerState.currentExpression;
  console.log(wgsl);

  return wgsl;
}
