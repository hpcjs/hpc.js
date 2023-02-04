export type GPUBufferWithInfo = {
  buffer: GPUBuffer;
  id: number;
  readBuffer?: GPUBuffer;
};
export type GPUBufferCollection = {
  [name: string]: GPUBufferWithInfo;
};

export type WalkerState = { currentExpression: string };
