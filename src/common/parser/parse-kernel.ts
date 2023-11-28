import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { GPUKernelSource } from '../types';
import functions from './functions';
import {
  GPUBufferCollection,
  GPUUniformCollection,
} from '../../gpu-backend/types';
import {
  getCplxSource,
  getRandomSource,
  getSetPixelSource,
} from './kernel-code/wgsl-funcs';
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
import {
  WalkerStateBufferCollection,
  WalkerStateUniformCollection,
  WalkerState,
  VariableType,
  GPUExpressionWithType,
} from './types';
import {
  CPUBufferCollection,
  CPUUniformCollection,
} from '../../cpu-backend/types';
import { getJsProxySource, getJsSetPixelSource } from './kernel-code/js-funcs';

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
  BlockStatement(node: any, state: WalkerState<string, string>, c: any) {
    let statement = '{\n';

    if (!state.addedPrelude) {
      statement += state.prelude;
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
  ExpressionStatement(node: any, state: WalkerState<string, string>, c: any) {
    c(node.expression, state);
  },
  AssignmentExpression(node: any, state: WalkerState<string, string>, c: any) {
    let expression = '';

    c(node.left, state);
    expression += state.currentExpression;
    const leftExpressionType = state.expressionType;

    c(node.right, state);
    expression += ` ${node.operator} ${state.currentExpression}`;
    state.currentExpression = expression;

    if (leftExpressionType != state.expressionType) {
      throw new Error(
        `Cannot assign ${state.expressionType} to ${leftExpressionType}`
      );
    }
  },
  MemberExpression(node: any, state: WalkerState<string, string>, c: any) {
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
    const parentSkipIdentifier = state.skipIdentifier;
    state.skipIdentifier =
      !arrayTypes.includes(memberExpressionParentType) &&
      node.property.type === 'Identifier';
    c(node.property, state);
    state.skipIdentifier = parentSkipIdentifier;

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
  Identifier(node: any, state: WalkerState<string, string>) {
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
  Literal(node: any, state: WalkerState<string, string>) {
    state.currentExpression = `${node.value}`;
    state.expressionType = 'number';
  },
  VariableDeclaration(node: any, state: WalkerState<string, string>, c: any) {
    let declarations = '';

    const mutability =
      node.kind === 'const'
        ? state.target === 'wgsl'
          ? 'let'
          : 'const'
        : state.target === 'wgsl'
        ? 'var'
        : 'let';

    for (const declaration of node.declarations) {
      c(declaration, state);
      declarations += `${mutability} ${state.currentExpression};\n`;
    }

    state.currentExpression = declarations.slice(0, -2);
  },
  VariableDeclarator(node: any, state: WalkerState<string, string>, c: any) {
    let declaration = '';

    state.skipIdentifier = true;
    c(node.id, state);
    state.skipIdentifier = false;
    declaration += state.currentExpression;

    c(node.init, state);
    state.variableTypes[node.id.name] = state.expressionType;

    const explicitType =
      state.expressionType === 'number' && state.target === 'wgsl'
        ? ': f32'
        : '';
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
        `Cannot assign expression of type '${state.expressionType}' to variable`
      );
    }
  },
  ForStatement(node: any, state: WalkerState<string, string>, c: any) {
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
  BinaryExpression(node: any, state: WalkerState<string, string>, c: any) {
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
  UpdateExpression(node: any, state: WalkerState<string, string>, c: any) {
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
  WhileStatement(node: any, state: WalkerState<string, string>, c: any) {
    let whileStatement = '';

    c(node.test, state);
    whileStatement += `while (${state.currentExpression}) `;

    c(node.body, state);
    whileStatement += wrapIfSingleLine(state.currentExpression);
    state.currentExpression = whileStatement;
  },
  IfStatement(node: any, state: WalkerState<string, string>, c: any) {
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
  LogicalExpression(node: any, state: WalkerState<string, string>, c: any) {
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
  ReturnStatement(node: any, state: WalkerState<string, string>, c: any) {
    let returnStatement = 'return';
    let returnType = 'void' as VariableType;

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
      state.functionReturnType !== returnType
    ) {
      throw new Error(
        `Function has inconsistent return types: ${state.functionReturnType} and ${returnType}`
      );
    }

    state.functionReturnType = returnType;
    state.currentExpression = returnStatement;

    if (state.target === 'js' && !state.insideFunctionDeclaration) {
      state.currentExpression = 'break inner_dispatch_loop';
    }
  },
  ConditionalExpression(node: any, state: WalkerState<string, string>, c: any) {
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
  CallExpression(node: any, state: WalkerState<string, string>, c: any) {
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
  UnaryExpression(node: any, state: WalkerState<string, string>, c: any) {
    c(node.argument, state);
    const var1 = state.currentExpression;
    const type1 = state.expressionType;

    processFunction(node.operator, null, [{ name: var1, type: type1 }], state);
  },
  ArrayExpression(node: any, state: WalkerState<string, string>, c: any) {
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
  BreakStatement(node: any, state: WalkerState<string, string>, c: any) {
    state.currentExpression = 'break';
  },
  ContinueStatement(node: any, state: WalkerState<string, string>, c: any) {
    state.currentExpression = 'continue';
  },
  FunctionDeclaration(node: any, state: WalkerState<string, string>, c: any) {
    if (state.insideFunctionDeclaration) {
      throw new Error('Nested function declarations are not allowed');
    }

    if (state.currentExpression !== '') {
      throw new Error('Function declarations must come before all other code');
    }

    state.addedPrelude = false;
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

    const originalPrelude = state.prelude;
    state.prelude = args
      .map(
        arg =>
          `    ${state.target === 'wgsl' ? 'var' : 'let'} ${arg.name} = param_${
            arg.name
          };\n`
      )
      .join('');
    state.functionReturnType = 'unknown';
    c(node.body, state);
    const body = state.currentExpression;
    if (state.functionReturnType === 'unknown') {
      state.functionReturnType = 'void';
    }
    const returnType = state.functionReturnType;

    const source =
      state.target === 'wgsl'
        ? `fn ${name}(hpc__globalId: vec3<f32>, ${args
            .map(p => `param_${p.name}: ${tsToWgslType(p.type)}`)
            .join(', ')}) -> ${tsToWgslType(state.functionReturnType)} ${body}`
        : `function ${name}(hpc__globalId, ${args
            .map(p => `param_${p.name}`)
            .join(', ')}) ${body}`;
    state.functionDeclarations.push({ name, args, returnType, source });

    const formula = `${name}(hpc__globalId${args
      .map((_, i) => `, $${i}`)
      .join('')})`;
    functions.standalone[name] = [
      {
        arguments: args.map(arg => arg.type),
        gpuFormula: formula,
        cpuFormula: formula,
        returnType,
      },
    ];

    state.insideFunctionDeclaration = false;
    state.currentExpression = '';
    state.variableTypes = {
      Math: 'math',
      [state.inputsVarName]: 'inputs',
    };
    state.prelude = originalPrelude;
  },
};

export function transpileKernelToWgsl<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  func: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface
  >,
  buffers: GPUBufferCollection<TBufferName> | undefined,
  uniforms: GPUUniformCollection<TUniformName> | undefined,
  canvas: HTMLCanvasElement | undefined,
  numRandSeeds: number
) {
  let transpiled = '';

  if (buffers) {
    transpiled += 'struct hpc__Data_number {\n    data: array<f32>\n}\n\n';
    transpiled += 'struct hpc__Data_vec2 {\n    data: array<vec2<f32>>\n}\n\n';
    transpiled += 'struct hpc__Data_vec3 {\n    data: array<vec3<f32>>\n}\n\n';
    transpiled += 'struct hpc__Data_vec4 {\n    data: array<vec4<f32>>\n}\n\n';

    for (const name in buffers) {
      transpiled += `@group(0) @binding(${buffers[name].id}) var<storage, read_write> hpc__data_${name}: hpc__Data_${buffers[name].type};\n`;
    }
    transpiled += '\n';
  }

  if (uniforms) {
    transpiled += 'struct hpc__Uniforms {\n';
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

      transpiled += `    @align(16) ${name}: ${type},\n`;
    }

    transpiled += `}\n\n@group(0) @binding(${
      buffers ? Object.keys(buffers).length : 0
    }) var<uniform> hpc__uniforms: hpc__Uniforms;\n\n`;
  }

  if (canvas) {
    transpiled += `struct hpc__PixelData {\n    data: array<vec3<f32>>\n}\n\n`;

    transpiled += `@group(0) @binding(${
      (buffers ? Object.keys(buffers).length : 0) + (uniforms ? 1 : 0)
    }) var<storage, read_write> hpc__pixels: hpc__PixelData;\n\n`;

    transpiled += `${getSetPixelSource(canvas.width, canvas.height)}\n\n`;
  }

  transpiled += `struct hpc__RandomData {\n    data: array<u32>\n}\n\n`;
  transpiled += `@group(0) @binding(${
    (buffers ? Object.keys(buffers).length : 0) +
    (uniforms ? 1 : 0) +
    (canvas ? 1 : 0)
  }) var<storage, read> hpc__random: hpc__RandomData;\n\n`;
  transpiled += `${getRandomSource()}\n\n`;

  transpiled += `${getCplxSource()}\n\n`;

  transpiled += parseKernelSource(
    func,
    buffers,
    uniforms,
    canvas,
    numRandSeeds,
    'wgsl'
  );

  console.log(transpiled);

  return transpiled;
}

export function transpileKernelToJs<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  func: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface
  >,
  buffers: CPUBufferCollection<TBufferName> | undefined,
  uniforms: CPUUniformCollection<TUniformName> | undefined,
  canvas: HTMLCanvasElement | undefined
) {
  let transpiled = '';

  for (const name in buffers) {
    transpiled += getJsProxySource(name, buffers[name].type);
  }

  if (canvas) {
    transpiled += getJsSetPixelSource(canvas.width, canvas.height);
  }

  transpiled += parseKernelSource(func, buffers, uniforms, canvas, 1024, 'js');
  console.log(transpiled);

  return transpiled;
}

function parseKernelSource<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TBufferName extends string,
  TUniformName extends string
>(
  func: GPUKernelSource<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface
  >,
  buffers: WalkerStateBufferCollection<TBufferName> | undefined,
  uniforms: WalkerStateUniformCollection<TUniformName> | undefined,
  canvas: HTMLCanvasElement | undefined,
  randBufferSize: number,
  target: 'wgsl' | 'js'
) {
  const src = func.toString();
  const ast = acorn.parse(src, { ecmaVersion: 2022, locations: true }) as any;
  const funcBody = ast.body[0].expression.body;
  const inputsVarName = ast.body[0].expression.params[0].name;

  const prelude =
    target === 'js'
      ? ''
      : `    let hpc__globalId = vec3<f32>(hpc__globalIdU32);\n    let hpc__randIndex = dot(hpc__globalIdU32, vec3<u32>(97073, 57641, 29269)) % (${randBufferSize});\n    hpc__randState = hpc__random.data[hpc__randIndex];\n`;

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
      [inputsVarName]: 'inputs',
    },
    skipIdentifier: false,
    memberExpressionParentName: '',
    memberExpressionParentType: 'unknown',
    memberExpressionChildName: '',
    memberExpressionChildType: 'unknown',
    insideArrayLiteral: false,
    addedPrelude: false,
    prelude: prelude,
    arrayLength: 0,
    arrayLengths: {},
    functionDeclarations: [],
    functionReturnType: 'unknown',
    insideFunctionDeclaration: false,
    target: target,
  } as WalkerState<TBufferName, TUniformName>;
  walk.recursive(funcBody, walkerState, handlers);

  let transpiled = walkerState.functionDeclarations
    .map(f => `${f.source}\n\n`)
    .join('');

  if (target === 'wgsl')
    transpiled +=
      '@compute @workgroup_size(1, 1)\nfn main(@builtin(global_invocation_id) hpc__globalIdU32: vec3<u32>) ';
  else
    transpiled += `const hpc__globalId = vec3(0, 0, 0);\nfor (hpc__globalId.x = 0; hpc__globalId.x < hpc__dispatchSize.x; hpc__globalId.x++) for (hpc__globalId.y = 0; hpc__globalId.y < hpc__dispatchSize.y; hpc__globalId.y++) inner_dispatch_loop: for (hpc__globalId.z = 0; hpc__globalId.z < hpc__dispatchSize.z; hpc__globalId.z++) `;

  transpiled += walkerState.currentExpression;

  return transpiled;
}
