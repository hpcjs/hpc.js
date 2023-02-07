import { GPUBufferSize } from './types';

export type GPUBufferWithInfo = {
  size: GPUBufferSize;
  buffer: GPUBuffer;
  id: number;
  readBuffer?: GPUBuffer;
  mapped: boolean;
};
export type GPUBufferCollection = {
  [name: string]: GPUBufferWithInfo;
};

export type WalkerState = {
  currentExpression: string;
  memberExpressionDepth: number;
  gpuBuffers: GPUBufferCollection;
};

export type GPUBufferSizeToBuffer<TSize> = TSize extends [number]
  ? number[]
  : TSize extends [number, number]
  ? number[][]
  : number[][][];
