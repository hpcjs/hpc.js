import { VariableType } from '../gpu-backend/types';
import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';
import { GPUBufferTypeStr } from './types';

export function tsToWgslType(type: VariableType) {
  switch (type) {
    case 'number':
      return 'f32';
    case 'vec2':
      return 'vec2<f32>';
    case 'vec3':
      return 'vec3<f32>';
    case 'vec4':
      return 'vec4<f32>';
    case 'boolean':
      return 'bool';
    case 'numberarray':
      return 'array<f32>';
    case 'vec2array':
      return 'array<vec2<f32>>';
    case 'vec3array':
      return 'array<vec3<f32>>';
    case 'vec4array':
      return 'array<vec4<f32>>';
    case 'booleanarray':
      return 'array<bool>';
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

export function typeLiteralToType(typeLiteral: VariableType) {
  const typeLiterals = [
    'numbertype',
    'vec2type',
    'vec3type',
    'vec4type',
    'booleantype',
  ];

  if (!typeLiterals.includes(typeLiteral)) {
    throw new Error(
      `Types must be specified with one of the following: ${typeLiterals
        .map(t => `types.${t.slice(0, -4)}`)
        .join(', ')}`
    );
  }

  return typeLiteral.slice(0, -4) as VariableType;
}

export function getDataType(val: number | GPUVec2 | GPUVec3 | GPUVec4) {
  if (typeof val === 'number') {
    return 'number';
  } else if (val instanceof GPUVec2) {
    return 'vec2';
  } else if (val instanceof GPUVec3) {
    return 'vec3';
  } else if (val instanceof GPUVec4) {
    return 'vec4';
  }

  throw new Error(`Invalid data type: ${val}`);
}

export function IsES5DefaultParamNode(node: any) {
  return (
    node.type === 'ConditionalExpression' &&
    node.test.type === 'LogicalExpression' &&
    node.test.left.type === 'BinaryExpression' &&
    node.test.left.left.type === 'MemberExpression' &&
    node.test.left.left.object.type === 'Identifier' &&
    node.test.left.left.object.name === 'arguments' &&
    node.test.left.left.property.type === 'Identifier' &&
    node.test.left.left.property.name === 'length' &&
    node.test.left.operator === '>' &&
    node.test.left.right.type === 'Literal' &&
    typeof node.test.left.right.value === 'number' &&
    node.test.operator === '&&' &&
    node.test.right.type === 'BinaryExpression' &&
    node.test.right.left.type === 'MemberExpression' &&
    node.test.right.left.object.type === 'Identifier' &&
    node.test.right.left.object.name === 'arguments' &&
    node.test.right.left.property.type === 'Literal' &&
    typeof node.test.right.left.property.value === 'number' &&
    node.test.right.operator === '!==' &&
    node.test.right.right.type === 'UnaryExpression' &&
    node.test.right.right.operator === 'void' &&
    node.test.right.right.argument.type === 'Literal' &&
    node.test.right.right.argument.value === 0 &&
    node.consequent.type === 'MemberExpression' &&
    node.consequent.object.type === 'Identifier' &&
    node.consequent.object.name === 'arguments' &&
    node.consequent.property.type === 'Literal' &&
    typeof node.consequent.property.value === 'number'
  );
}

export function strideFromType(type: GPUBufferTypeStr) {
  if (type === 'number') {
    return 1;
  } else if (type === 'vec2') {
    return 2;
  } else {
    return 4;
  }
}
