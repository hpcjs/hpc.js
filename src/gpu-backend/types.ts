import { GPUBufferSize } from '../common/types';

export type GPUBufferWithInfo = {
  size: GPUBufferSize;
  resource: GPUBuffer;
  id: number;
  readBuffer?: GPUBuffer;
  mapped: boolean;
};
export type GPUUniformInfo = {
  id: number;
  value: number;
};

export type GPUBufferCollection<TName extends string> = {
  [K in TName]: GPUBufferWithInfo;
};
export type GPUUniformCollection<TName extends string> = {
  [K in TName]: GPUUniformInfo;
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
  | 'buffersizes'
  | 'buffers'
  | 'buffer1d'
  | 'buffer2d'
  | 'buffer3d'
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
  | 'booleanarray';
export type WGSLType<T extends VariableType> = T extends 'number'
  ? 'f32'
  : T extends 'vec2'
  ? 'vec2<f32>'
  : T extends 'vec3'
  ? 'vec3<f32>'
  : T extends 'vec4'
  ? 'vec4<f32>'
  : never;
export type GPUWalkerState<
  TBufferName extends string,
  TUniformName extends string
> = {
  currentExpression: string;
  buffers?: GPUBufferCollection<TBufferName>;
  uniforms?: GPUUniformCollection<TUniformName>;
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
  arrayLength: number;
  arrayLengths: { [key: string]: number };
};

export type GPUExpressionWithType = {
  name: string;
  type: VariableType;
};
