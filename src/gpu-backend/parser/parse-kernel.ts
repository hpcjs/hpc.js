import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GPUKernelSource } from '../../common/types';
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
import { GPUVec2 } from '../../gpu-types/vec2';
import { GPUVec3 } from '../../gpu-types/vec3';
import { GPUVec4 } from '../../gpu-types/vec4';
import {
  IsES5DefaultParamNode,
  tsToWgslType,
  typeLiteralToType,
} from '../../common/utils';

// required since minification turns vec3
// into  __WEBPACK_IMPORTED_MODULE__.vec3
const memberExpressionSkipTriggers = {
  vec2: 'function',
  vec3: 'function',
  vec4: 'function',
  array: 'function',
  dim: 'function',
  types: 'types',
} as const;

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
      if (state.currentExpression === '') {
        continue;
      }

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
      node.object.type === 'Identifier' &&
      node.property.type === 'Identifier' &&
      node.property.name in memberExpressionSkipTriggers
    ) {
      state.currentExpression = node.property.name;
      state.expressionType =
        memberExpressionSkipTriggers[
          node.property.name as keyof typeof memberExpressionSkipTriggers
        ];
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
      state.expressionType = 'function';
      return;
    }

    throw new Error(`Unknown variable '${node.name}'`);
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

    const explicitType = state.expressionType === 'number' ? ': f32' : '';
    declaration += `${explicitType} = ${state.currentExpression}`;
    state.currentExpression = declaration;

    const arrayTypes = [
      'numberarray',
      'vec2array',
      'vec3array',
      'vec4array',
      'booleanarray',
    ];
    if (arrayTypes.includes(state.expressionType)) {
      state.arrayLengths[node.id.name] = state.arrayLength;
    }

    const allowedTypes = [
      'number',
      'vec2',
      'vec3',
      'vec4',
      'boolean',
      'numberarray',
      'vec2array',
      'vec3array',
      'vec4array',
      'booleanarray',
    ];
    if (!allowedTypes.includes(state.expressionType)) {
      throw new Error(
        `Cannot assign expression of type ${state.expressionType} to variable`
      );
    }
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
    let returnType = 'void';

    if (node.argument) {
      c(node.argument, state);
      returnStatement += ` ${state.currentExpression}`;
      returnType = state.expressionType;

      if (!state.insideFunctionDeclaration) {
        throw new Error(
          'Returning an expression from the kernel is not allowed'
        );
      }
    }

    if (
      state.functionReturnType !== 'unknown' &&
      state.functionReturnType !== state.expressionType
    ) {
      throw new Error(
        `Function has inconsistent return types: ${state.functionReturnType} and ${state.expressionType}`
      );
    }

    state.functionReturnType = state.expressionType;
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
    state.arrayLength = node.elements.length;
  },
  BreakStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
    state.currentExpression = 'break';
  },
  ContinueStatement(node: any, state: GPUWalkerState<string, string>, c: any) {
    state.currentExpression = 'continue';
  },
  FunctionDeclaration(
    node: any,
    state: GPUWalkerState<string, string>,
    c: any
  ) {
    if (state.insideFunctionDeclaration) {
      throw new Error('Nested function declarations are not allowed');
    }

    if (state.currentExpression !== '') {
      throw new Error('Function declarations must come before all other code');
    }

    state.insideFunctionDeclaration = true;
    const args = [] as GPUExpressionWithType[];

    // check if default params are es5 or es6
    if (
      node.params.length !== 0 &&
      node.params[0].type === 'AssignmentPattern'
    ) {
      // es6
      for (const param of node.params) {
        state.skipIdentifier = true;
        c(param.left, state);
        state.skipIdentifier = false;
        const name = state.currentExpression;

        c(param.right, state);
        const typeLiteral = state.expressionType;
        const type = typeLiteralToType(typeLiteral);

        args.push({ name, type });
        state.variableTypes[name] = type;
      }
    } else if (
      node.body.body.length !== 0 &&
      node.body.body[0].type === 'VariableDeclaration'
    ) {
      // es5
      // could also be an empty parameter list
      // but the code works out to be the same
      const paramDeclarations = node.body.body[0].declarations;
      let isES6ParamInit = true;

      for (const param of paramDeclarations) {
        state.skipIdentifier = true;
        c(param.id, state);
        state.skipIdentifier = false;
        const name = state.currentExpression;

        if (!IsES5DefaultParamNode(param.init)) {
          isES6ParamInit = false;
          break;
        }

        c(param.init.alternate, state);
        const typeLiteral = state.expressionType;
        const type = typeLiteralToType(typeLiteral);

        args.push({ name, type });
        state.variableTypes[name] = type;
      }

      if (isES6ParamInit) {
        node.body.body.shift();
      }
    }

    state.skipIdentifier = true;
    c(node.id, state);
    state.skipIdentifier = false;
    const name = state.currentExpression;

    state.functionReturnType = 'unknown';
    c(node.body, state);
    const body = state.currentExpression;
    if (state.functionReturnType === 'unknown') {
      state.functionReturnType = 'void';
    }
    const returnType = state.functionReturnType;

    const source = `fn ${name}(global_id: vec3<f32>, ${args
      .map(p => `${p.name}: ${tsToWgslType(p.type)}`)
      .join(', ')}) -> ${tsToWgslType(state.functionReturnType)} ${body}`;
    state.functionDeclarations.push({ name, args, returnType, source });

    const formula = `${name}(global_id${args
      .map((_, i) => `, $${i}`)
      .join('')})`;
    functions.standalone[name] = [
      {
        arguments: args.map(arg => arg.type),
        formula,
        returnType,
      },
    ];

    state.insideFunctionDeclaration = false;
    state.currentExpression = '';
    state.variableTypes = {
      Math: 'math',
      [state.inputsVarName]: 'unknown',
    };
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
      const value = uniforms[name].value;
      const type =
        typeof value === 'number'
          ? 'f32'
          : value instanceof GPUVec2
          ? 'vec2<f32>'
          : value instanceof GPUVec3
          ? 'vec3<f32>'
          : value instanceof GPUVec4
          ? 'vec4<f32>'
          : 'unknown';

      wgsl += `    @align(16) ${name}: ${type},\n`;
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
    arrayLength: 0,
    arrayLengths: {},
    functionDeclarations: [],
    functionReturnType: 'unknown',
    insideFunctionDeclaration: false,
  } as GPUWalkerState<TBufferName, TUniformName>;
  walk.recursive(funcBody, walkerState, handlers);

  wgsl += walkerState.functionDeclarations.map(f => `${f.source}\n\n`).join('');

  wgsl +=
    '@compute @workgroup_size(1, 1)\nfn main(@builtin(global_invocation_id) global_id_u32: vec3<u32>) ';
  wgsl += walkerState.currentExpression;

  console.log(wgsl);
  return wgsl;
}
