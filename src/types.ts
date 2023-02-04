export type GPUBufferSize =
  | [number]
  | [number, number]
  | [number, number, number];
export type GPUBufferSpec = {
  name: string;
  size: GPUBufferSize;
  readable: boolean;
  initialData?: number[];
};

export type GPUVec2 = { x: number; y: number };
export type GPUVec3 = { x: number; y: number; z: number };
export type GPUVec4 = { x: number; y: number; z: number; w: number };

export type GPUKernelBuffersInfo = {
  [name: string]: number[];
};
export type GPUKernelInputs = {
  threadId: GPUVec3;
  buffers: GPUKernelBuffersInfo;
};
export type GPUKernelSource = (inputs: GPUKernelInputs) => void;
export type GPUKernel = {
  run: (x: number, y?: number, z?: number) => void;
};
