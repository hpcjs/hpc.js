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

export type GPUWalkerState<
  TBufferName extends string,
  TUniformName extends string
> = {
  currentExpression: string;
  memberExpressionDepth: number;
  gpuBuffers?: GPUBufferCollection<TBufferName>;
  gpuUniforms?: GPUUniformCollection<TUniformName>;
};
