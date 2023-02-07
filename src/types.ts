export type GPUBufferSize =
  | [number]
  | [number, number]
  | [number, number, number];
export type GPUBufferSpec<TName extends string> =
  | {
      name: TName;
      size: [number];
      readable: boolean;
      initialData?: number[];
    }
  | {
      name: TName;
      size: [number, number];
      readable: boolean;
      initialData?: number[][];
    }
  | {
      name: TName;
      size: [number, number, number];
      readable: boolean;
      initialData?: number[][][];
    };

export type GPUVec2 = { x: number; y: number };
export type GPUVec3 = { x: number; y: number; z: number };
export type GPUVec4 = { x: number; y: number; z: number; w: number };

export type GPUKernelInputs<TGPUKernelBuffersInterface> = {
  threadId: GPUVec3;
  buffers: TGPUKernelBuffersInterface;
};
export type GPUKernelSource<TGPUKernelBuffersInterface> = (
  inputs: GPUKernelInputs<TGPUKernelBuffersInterface>
) => void;
export type GPUKernel = {
  run: (x: number, y?: number, z?: number) => void;
};
