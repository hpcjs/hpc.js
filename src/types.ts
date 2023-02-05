export type GPUBufferSize =
  | [number]
  | [number, number]
  | [number, number, number];
export type GPUBufferSpec<TName extends string> = {
  name: TName;
  size: GPUBufferSize;
  readable: boolean;
  initialData?: number[];
};

export type GPUVec2 = { x: number; y: number };
export type GPUVec3 = { x: number; y: number; z: number };
export type GPUVec4 = { x: number; y: number; z: number; w: number };

export type GPUKernelBuffersInfo<TBufferName extends string> = {
  // TODO
  // turn into number[] | number[][] | number[][][]
  [K in TBufferName]: any;
};
export type GPUKernelInputs<TBufferName extends string> = {
  threadId: GPUVec3;
  buffers: GPUKernelBuffersInfo<TBufferName>;
};
export type GPUKernelSource<TBufferName extends string> = (
  inputs: GPUKernelInputs<TBufferName>
) => void;
export type GPUKernel = {
  run: (x: number, y?: number, z?: number) => void;
};
