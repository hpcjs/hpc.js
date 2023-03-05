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
  currentNodeIsLeftOfMemberExpression: boolean;
  buffers?: CPUBufferCollection<TBufferName>;
  uniforms?: CPUUniformCollection<TUniformName>;
  canvas?: HTMLCanvasElement;
  inputsVarName: string;
};

export type CPUTranspiledKernelArgs<
  TBufferName extends string,
  TUniformName extends string
> = {
  threadId: GPUVec3;
  buffers?: CPUBufferCollection<TBufferName>;
  uniforms?: CPUUniformCollection<TUniformName>;
  canvas?: {
    width: number;
    height: number;
    setPixel: (x: number, y: number, r: number, g: number, b: number) => void;
  };
};
