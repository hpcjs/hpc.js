import { GPUBufferSize, GPUVec3 } from '../common/types';

export type CPUBufferWithInfo = {
  size: GPUBufferSize;
  resource: Float32Array;
};

export type CPUBufferCollection<TName extends string> = {
  [K in TName]: CPUBufferWithInfo;
};

export type CPUUniformCollection<TName extends string> = {
  [K in TName]: number;
};

export type CPUWalkerState<
  TBufferName extends string,
  TUniformName extends string
> = {
  currentExpression: string;
  memberExpressionDepth: number;
  buffers?: CPUBufferCollection<TBufferName>;
  uniforms?: CPUUniformCollection<TUniformName>;
};

export type CPUTranspiledKernelArgs<
  TBufferName extends string,
  TUniformName extends string
> = {
  buffers?: CPUBufferCollection<TBufferName>;
  uniforms?: CPUUniformCollection<TUniformName>;
  threadId: GPUVec3;
  funcs: {
    setPixel: (x: number, y: number, r: number, g: number, b: number) => void;
  };
};
