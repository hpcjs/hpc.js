import { VariableType } from '../gpu-backend/types';

export function tsToWgslType(type: VariableType) {
  switch (type) {
    case 'number':
      return 'f32';
    case 'boolean':
      return 'bool';
    case 'vec2':
      return 'vec2<f32>';
    case 'vec3':
      return 'vec3<f32>';
    case 'vec4':
      return 'vec4<f32>';
    default:
      throw new Error(
        `Type ${type} cannot be used in an expression or variable assignment`
      );
  }
}

export function findMatchingBracket(str: string, start: number) {
  let count = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '[') {
      count++;
    } else if (str[i] === ']') {
      count--;
    }
    if (count === 0) {
      return i;
    }
  }

  return -1;
}
