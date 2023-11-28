import { findMatchingBracket } from '../../common/utils';
import { GPUVec2 } from '../../gpu-types/vec2';
import { GPUVec3 } from '../../gpu-types/vec3';
import { GPUVec4 } from '../../gpu-types/vec4';
import { GPUExpressionWithType, WalkerState, VariableType } from './types';
import functions from './functions';

export function processFunction(
  functionName: string,
  parentObject: GPUExpressionWithType | null,
  args: GPUExpressionWithType[],
  state: WalkerState<string, string>
) {
  const parentObjectType = parentObject ? parentObject.type : 'standalone';
  const relevantFunctions = functions[parentObjectType];
  if (!(functionName in relevantFunctions)) {
    throw new Error(
      `Unknown function/operator: ${parentObjectType}.${functionName}`
    );
  }

  const overloads = relevantFunctions[functionName];
  for (const func of overloads) {
    if (func.arguments.length !== args.length) {
      continue;
    }

    let argTypesMismatch = false;
    for (let i = 0; i < args.length; i++) {
      if (func.arguments[i] !== args[i].type) {
        argTypesMismatch = true;
      }
    }
    if (argTypesMismatch) {
      continue;
    }

    let formula = state.target === 'wgsl' ? func.gpuFormula : func.cpuFormula;
    let expressions = [];
    if (parentObject) {
      expressions.push(parentObject);
    }
    for (let i = 0; i < args.length; i++) {
      expressions.push(args[i]);
    }

    for (let i = 0; i < expressions.length; i++) {
      formula = formula.replace(`$${i}`, expressions[i].name);
    }

    if (expressions[0].type.includes('array')) {
      if (state.arrayLengths[expressions[0].name]) {
        state.arrayLength = state.arrayLengths[expressions[0].name];
      }

      formula = formula.replace('$s', `${state.arrayLength}`);
      formula = formula.replace(
        '$r',
        `${expressions[1]}, `.repeat(parseInt(expressions[0].name)).slice(0, -2)
      );
    } else if (state.buffers && /^buffer[123]d/.test(expressions[0].type)) {
      const bufferNames = Object.keys(state.buffers);
      const bufferRegex = new RegExp(
        String.raw`^${state.inputsVarName}\[buffers\]\[(${bufferNames.join(
          '|'
        )})\]`
      );
      const match = bufferRegex.exec(expressions[0].name);

      if (match) {
        const bufferName = match[1];
        const buffer = state.buffers[bufferName];
        const numIndices = parseInt(expressions[0].type[6]);
        const size = buffer.size
          .slice(buffer.size.length - numIndices)
          .join(', ');
        formula = formula.replace('$s', size);
      }
    }

    state.currentExpression = formula;
    state.expressionType = func.returnType;
    return;
  }

  const prefix =
    parentObjectType === 'standalone' ? '' : `${parentObjectType}.`;
  throw new Error(
    `No matching function overload for ${prefix}${functionName}(${args
      .map(arg => arg.type)
      .join(', ')})`
  );
}

export function processExpressionFields(state: WalkerState<string, string>) {
  if (state.memberExpressionParentType === 'unknown') {
    return;
  }

  const expressionFields: {
    [K in VariableType]: {
      property: string;
      type: VariableType;
    }[];
  } = {
    number: [],
    vec2: [],
    vec3: [],
    vec4: [],
    boolean: [],
    math: [],
    unknown: [],
    void: [],
    canvas: [],
    function: [],
    uniforms: [],
    buffers: [],
    buffer1dnumber: [],
    buffer2dnumber: [],
    buffer3dnumber: [],
    buffer1dvec2: [],
    buffer2dvec2: [],
    buffer3dvec2: [],
    buffer1dvec3: [],
    buffer2dvec3: [],
    buffer3dvec3: [],
    buffer1dvec4: [],
    buffer2dvec4: [],
    buffer3dvec4: [],
    numberarrayliteral: [],
    vec2arrayliteral: [],
    vec3arrayliteral: [],
    vec4arrayliteral: [],
    booleanarrayliteral: [],
    numberarray: [],
    vec2array: [],
    vec3array: [],
    vec4array: [],
    booleanarray: [],
    numbertype: [],
    vec2type: [],
    vec3type: [],
    vec4type: [],
    booleantype: [],
    types: [],
    inputs: [],
  };

  // type literals
  const typeLiterals = ['number', 'vec2', 'vec3', 'vec4', 'boolean'] as const;
  for (const type of typeLiterals) {
    expressionFields.types.push({
      property: type,
      type: (type + 'type') as VariableType,
    });
  }

  // swizzling
  const sizes = {
    1: 'number',
    2: 'vec2',
    3: 'vec3',
    4: 'vec4',
  };
  const letters = {
    0: 'x',
    1: 'y',
    2: 'z',
    3: 'w',
  };

  for (let dim = 2; dim <= 4; dim++) {
    for (let size = 1; size <= 4; size++) {
      for (let swizzle = 0; swizzle < dim ** size; swizzle++) {
        const baseConverted = swizzle.toString(dim).padStart(size, '0');
        const swizzleString = baseConverted
          .split('')
          .map(c => letters[parseInt(c) as 0 | 1 | 2 | 3])
          .join('');
        expressionFields[sizes[dim as 1 | 2 | 3 | 4] as VariableType].push({
          property: swizzleString,
          type: sizes[size as 1 | 2 | 3 | 4] as VariableType,
        });
      }
    }
  }

  // functions
  const methods = Object.keys(functions[state.memberExpressionParentType]);
  for (const method of methods) {
    expressionFields[state.memberExpressionParentType].push({
      property: method,
      type: 'function',
    });
  }

  const fields = expressionFields[state.memberExpressionParentType];
  for (const field of fields) {
    if (field.property === state.memberExpressionChildName) {
      state.currentExpression = `${state.memberExpressionParentName}.${field.property}`;
      state.expressionType = field.type;
      return;
    }
  }
}

export function processSpecialVariable(state: WalkerState<string, string>) {
  const specialVariables: {
    regex: RegExp | string | ((expr: string) => [boolean, string[]]);
    formula: string;
    type: VariableType;
  }[] = [
    {
      regex: `${state.inputsVarName}[threadId]`,
      formula: 'global_id',
      type: 'vec3',
    },
  ];

  if (state.buffers) {
    specialVariables.push({
      regex: `${state.inputsVarName}[buffers]`,
      formula: `${state.inputsVarName}[buffers]`,
      type: 'buffers',
    });

    for (const bufferName in state.buffers) {
      // primary replacement
      const buffer = state.buffers[bufferName];
      const matchFunction: (expr: string) => [boolean, string[]] = (
        expr: string
      ) => {
        const prefix = `${state.inputsVarName}[buffers][${bufferName}]`;
        if (expr.slice(0, prefix.length) !== prefix) {
          return [false, []];
        }

        let currentBracketIndex = prefix.length;
        const args: string[] = [];

        for (let i = 0; i < buffer.size.length; i++) {
          const nextBracketIndex = findMatchingBracket(
            expr,
            currentBracketIndex
          );
          if (nextBracketIndex === -1) {
            return [false, []];
          }

          const bracketContents = expr.slice(
            currentBracketIndex + 1,
            nextBracketIndex
          );
          args.push(bracketContents);

          currentBracketIndex = nextBracketIndex + 1;
        }

        if (currentBracketIndex !== expr.length) {
          return [false, []];
        }

        return [true, args];
      };

      const prefix = state.target === 'wgsl' ? 'data_' : 'proxy_';
      const suffix = state.target === 'wgsl' ? '.data' : '';
      let formula = `${prefix}${bufferName}${suffix}[`;
      for (let i = 0; i < buffer.size.length; i++) {
        if (i > 0) {
          formula += ' + ';
        }
        if (state.target === 'wgsl') formula += `i32($${i})`;
        else formula += `Math.floor($${i})`;
        for (let j = 0; j < i; j++) {
          formula += ` * ${buffer.size[j]}`;
        }
      }
      formula += ']';

      specialVariables.push({
        regex: matchFunction,
        formula,
        type: state.buffers[bufferName].type,
      });

      // intermediate steps
      for (let step = buffer.size.length - 1; step >= 0; step--) {
        const intermediateMatchFunction: (
          expr: string
        ) => [boolean, string[]] = (expr: string) => {
          const prefix = `${state.inputsVarName}[buffers][${bufferName}]`;
          if (expr.slice(0, prefix.length) !== prefix) {
            return [false, []];
          }

          let currentBracketIndex = prefix.length;
          const args: string[] = [];

          for (let i = 0; i < step; i++) {
            const nextBracketIndex = findMatchingBracket(
              expr,
              currentBracketIndex
            );
            if (nextBracketIndex === -1) {
              return [false, []];
            }

            const bracketContents = expr.slice(
              currentBracketIndex + 1,
              nextBracketIndex
            );
            args.push(bracketContents);

            currentBracketIndex = nextBracketIndex + 1;
          }

          if (currentBracketIndex !== expr.length) {
            return [false, []];
          }

          return [true, args];
        };

        let formula = `${state.inputsVarName}[buffers][${bufferName}]`;
        for (let i = 0; i < step; i++) {
          formula += `[$${i}]`;
        }

        // in the future, typescript will be able to say
        // step: 0 | 1 | 2
        // but I am limited by the technology of my time
        specialVariables.push({
          regex: intermediateMatchFunction,
          formula,
          type: (`buffer${buffer.size.length - step}d` +
            state.buffers[bufferName].type) as any,
        });
      }
    }
  }

  if (state.uniforms) {
    specialVariables.push({
      regex: `${state.inputsVarName}[uniforms]`,
      formula: `${state.inputsVarName}[uniforms]`,
      type: 'uniforms',
    });

    for (const uniformName in state.uniforms) {
      const value = state.uniforms[uniformName].value;
      const type =
        typeof value === 'number'
          ? 'number'
          : value instanceof GPUVec2
          ? 'vec2'
          : value instanceof GPUVec3
          ? 'vec3'
          : value instanceof GPUVec4
          ? 'vec4'
          : 'unknown';

      specialVariables.push({
        regex: `${state.inputsVarName}[uniforms][${uniformName}]`,
        formula: `uniforms.${uniformName}${
          state.target === 'js' ? '.value' : ''
        }`,
        type,
      });
    }
  }

  if (state.canvas) {
    const canvasSizeFormulaVec2 =
      state.target === 'wgsl' ? 'vec2<f32>' : 'vec2';

    specialVariables.push({
      regex: `${state.inputsVarName}[canvas]`,
      formula: `${state.inputsVarName}[canvas]`,
      type: 'canvas',
    });
    specialVariables.push({
      regex: `${state.inputsVarName}[canvas][size]`,
      formula: `${canvasSizeFormulaVec2}(${state.canvas.width}, ${state.canvas.height})`,
      type: 'vec2',
    });
    specialVariables.push({
      regex: `${state.inputsVarName}[canvas][setPixel]`,
      formula: 'setPixel',
      type: 'function',
    });
  }

  for (const specialVariable of specialVariables) {
    if (typeof specialVariable.regex === 'string') {
      if (state.currentExpression === specialVariable.regex) {
        state.currentExpression = specialVariable.formula;
        state.expressionType = specialVariable.type;

        return;
      }
    } else if (typeof specialVariable.regex === 'function') {
      const [match, args] = specialVariable.regex(state.currentExpression);
      if (match) {
        let formula = specialVariable.formula;
        for (let i = 0; i < args.length; i++) {
          formula = formula.replace(`$${i}`, args[i]);
        }

        state.currentExpression = formula;
        state.expressionType = specialVariable.type;

        return;
      }
    } else {
      const match = state.currentExpression.match(specialVariable.regex);
      if (match) {
        let formula = specialVariable.formula;
        for (let i = 0; i < match.length - 1; i++) {
          formula = formula.replace(`$${i}`, match[i + 1]);
        }

        state.currentExpression = formula;
        state.expressionType = specialVariable.type;

        return;
      }
    }
  }
}

export function wrapIfSingleLine(text: string) {
  return text.includes('\n') ? text : `{ ${text}; }`;
}

export function processArrayAccess(state: WalkerState<string, string>) {
  const arrayTypes = [
    'numberarray',
    'vec2array',
    'vec3array',
    'vec4array',
    'booleanarray',
  ];
  if (!arrayTypes.includes(state.memberExpressionParentType)) {
    return;
  }

  if (state.memberExpressionChildType !== 'number') {
    throw new Error(
      `Array access must be done with a number, but got ${state.memberExpressionChildType}`
    );
  }

  state.currentExpression = `${state.memberExpressionParentName}[${
    state.target === 'wgsl' ? 'i32' : 'Math.floor'
  }(${state.memberExpressionChildName})]`;
  state.expressionType = state.memberExpressionParentType.replace(
    'array',
    ''
  ) as any;
}
