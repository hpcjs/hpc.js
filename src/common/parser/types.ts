import { GPUVec2 } from '../../gpu-types/vec2';
import { GPUVec3 } from '../../gpu-types/vec3';
import { GPUVec4 } from '../../gpu-types/vec4';
import { GPUBufferSize } from '../types';

export type WalkerStateBufferCollection<TName extends string> = {
  [K in TName]: WalkerStateBuffer;
};

export type WalkerStateBuffer = {
  size: GPUBufferSize;
  type: 'number' | 'vec2' | 'vec3' | 'vec4';
};

export type WalkerStateUniformCollection<TName extends string> = {
  [K in TName]: WalkerStateUniform;
};

export type WalkerStateUniform = {
  value: number | GPUVec2 | GPUVec3 | GPUVec4;
};

export type VariableType =
  | 'number'
  | 'vec2'
  | 'vec3'
  | 'vec4'
  | 'boolean'
  | 'math'
  | 'unknown'
  | 'canvas'
  | 'buffers'
  | 'buffer1dnumber'
  | 'buffer2dnumber'
  | 'buffer3dnumber'
  | 'buffer1dvec2'
  | 'buffer2dvec2'
  | 'buffer3dvec2'
  | 'buffer1dvec3'
  | 'buffer2dvec3'
  | 'buffer3dvec3'
  | 'buffer1dvec4'
  | 'buffer2dvec4'
  | 'buffer3dvec4'
  | 'uniforms'
  | 'function'
  | 'void'
  | 'numberarrayliteral'
  | 'vec2arrayliteral'
  | 'vec3arrayliteral'
  | 'vec4arrayliteral'
  | 'booleanarrayliteral'
  | 'numberarray'
  | 'vec2array'
  | 'vec3array'
  | 'vec4array'
  | 'booleanarray'
  | 'numbertype'
  | 'vec2type'
  | 'vec3type'
  | 'vec4type'
  | 'booleantype'
  | 'types'
  | 'inputs';
export type WGSLType<T extends VariableType> = T extends 'number'
  ? 'f32'
  : T extends 'vec2'
  ? 'vec2<f32>'
  : T extends 'vec3'
  ? 'vec3<f32>'
  : T extends 'vec4'
  ? 'vec4<f32>'
  : never;
export type WalkerState<
  TBufferName extends string,
  TUniformName extends string
> = {
  currentExpression: string;
  buffers?: WalkerStateBufferCollection<TBufferName>;
  uniforms?: WalkerStateUniformCollection<TUniformName>;
  canvas?: HTMLCanvasElement;
  inputsVarName: string;
  variableTypes: { [key: string]: VariableType };
  expressionType: VariableType;
  skipIdentifier: boolean;
  memberExpressionParentName: string;
  memberExpressionParentType: VariableType;
  memberExpressionChildName: string;
  memberExpressionChildType: VariableType;
  insideArrayLiteral: boolean;
  addedPrelude: boolean;
  prelude: string;
  arrayLength: number;
  arrayLengths: { [key: string]: number };
  functionDeclarations: GPUFunctionDeclaration[];
  functionReturnType: VariableType;
  insideFunctionDeclaration: boolean;
  target: 'wgsl' | 'js';
};

export type GPUExpressionWithType = {
  name: string;
  type: VariableType;
};

export type GPUFunctionDeclaration = {
  name: string;
  returnType: VariableType;
  args: GPUExpressionWithType[];
  source: string;
};
