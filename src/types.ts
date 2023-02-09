export type GPUBufferSize =
  | [number]
  | [number, number]
  | [number, number, number];
export type GPUBufferSpec<TName extends string> =
  | {
      name: TName;
      size: [number];
      initialData?: number[];
    }
  | {
      name: TName;
      size: [number, number];
      initialData?: number[][];
    }
  | {
      name: TName;
      size: [number, number, number];
      initialData?: number[][][];
    };
export type GPUUniformSpec<TName extends string> = { [K in TName]: number };

export type GPUVec2 = { x: number; y: number };
export type GPUVec3 = { x: number; y: number; z: number };
export type GPUVec4 = { x: number; y: number; z: number; w: number };

export type GPUKernelInputs<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface
> = {
  threadId: GPUVec3;
  buffers: TGPUKernelBuffersInterface;
  uniforms: TGPUKernelUniformsInterface;
  funcs: {
    setPixel: (x: number, y: number, r: number, g: number, b: number) => void;
  };
};
export type GPUKernelSource<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface
> = (
  inputs: GPUKernelInputs<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface
  >
) => void;
export type GPUKernel = {
  run: (x: number, y?: number, z?: number) => void;
};
