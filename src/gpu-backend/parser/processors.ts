import { findMatchingBracket } from '../../common/utils';
import { GPUExpressionWithType, GPUWalkerState, VariableType } from '../types';
import functions from './functions';

export function processFunction(
  functionName: string,
  parentObject: GPUExpressionWithType | null,
  args: GPUExpressionWithType[],
  state: GPUWalkerState<string, string>
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

    let formula = func.formula;
    if (parentObject) {
      formula = formula.replace('$0', parentObject.name);

      for (let i = 0; i < args.length; i++) {
        formula = formula.replace(`$${i + 1}`, args[i].name);
      }
    } else {
      for (let i = 0; i < args.length; i++) {
        formula = formula.replace(`$${i}`, args[i].name);
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

export function processExpressionFields(state: GPUWalkerState<string, string>) {
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
    buffersizes: [],
    uniforms: [],
    buffers: [],
    buffer: [],
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
  };

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

  for (let maxSize = 2; maxSize <= 4; maxSize++) {
    for (let size = 1; size <= maxSize; size++) {
      for (let swizzle = 0; swizzle < maxSize ** size; swizzle++) {
        const baseConverted = swizzle.toString(maxSize).padStart(size, '0');
        const swizzleString = baseConverted
          .split('')
          .map(c => letters[parseInt(c) as 0 | 1 | 2 | 3])
          .join('');
        expressionFields[sizes[maxSize as 1 | 2 | 3 | 4] as VariableType].push({
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

export function processSpecialVariable(state: GPUWalkerState<string, string>) {
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

      let formula = `data_${bufferName}.data[`;
      for (let i = 0; i < buffer.size.length; i++) {
        if (i > 0) {
          formula += ' + ';
        }
        formula += `i32($${i})`;
        for (let j = 0; j < i; j++) {
          formula += ` * ${buffer.size[j]}`;
        }
      }
      formula += ']';

      specialVariables.push({
        regex: matchFunction,
        formula,
        type: 'number',
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

        specialVariables.push({
          regex: intermediateMatchFunction,
          formula,
          type: 'buffer',
        });
      }

      // buffer size
      specialVariables.push({
        regex: `${state.inputsVarName}[sizes]`,
        formula: `${state.inputsVarName}[sizes]`,
        type: 'buffersizes',
      });

      if (buffer.size.length === 1) {
        specialVariables.push({
          regex: `${state.inputsVarName}[sizes][${bufferName}]`,
          formula: `${buffer.size[0]}`,
          type: 'number',
        });
      } else if (buffer.size.length === 2) {
        specialVariables.push({
          regex: `${state.inputsVarName}[sizes][${bufferName}]`,
          formula: `vec2<f32>(${buffer.size[0]}, ${buffer.size[1]})`,
          type: 'vec2',
        });
      } else {
        specialVariables.push({
          regex: `${state.inputsVarName}[sizes][${bufferName}]`,
          formula: `vec3<f32>(${buffer.size[0]}, ${buffer.size[1]}, ${buffer.size[2]})`,
          type: 'vec3',
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
      specialVariables.push({
        regex: `${state.inputsVarName}[uniforms][${uniformName}]`,
        formula: `uniforms.${uniformName}`,
        type: 'number',
      });
    }
  }

  if (state.canvas) {
    specialVariables.push({
      regex: `${state.inputsVarName}[canvas]`,
      formula: `${state.inputsVarName}[canvas]`,
      type: 'canvas',
    });
    specialVariables.push({
      regex: `${state.inputsVarName}[canvas][width]`,
      formula: `${state.canvas.width}`,
      type: 'number',
    });
    specialVariables.push({
      regex: `${state.inputsVarName}[canvas][height]`,
      formula: `${state.canvas.height}`,
      type: 'number',
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

export function processArrayAccess(state: GPUWalkerState<string, string>) {
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

  state.currentExpression = `${state.memberExpressionParentName}[i32(${state.memberExpressionChildName})]`;
  state.expressionType = state.memberExpressionParentType.replace(
    'array',
    ''
  ) as any;
}
