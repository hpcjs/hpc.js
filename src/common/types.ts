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
  TGPUKernelUniformsInterface,
  TGPUKernelMiscInfoInterface
> = {
  threadId: GPUVec3;
  buffers: TGPUKernelBuffersInterface;
  uniforms: TGPUKernelUniformsInterface;
  sizes: TGPUKernelMiscInfoInterface;
  usingCpu: boolean;
  funcs: {
    setPixel: (x: number, y: number, r: number, g: number, b: number) => void;
  };
};
export type GPUKernelSource<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface,
  TGPUKernelMiscInfoInterface
> = (
  inputs: GPUKernelInputs<
    TGPUKernelBuffersInterface,
    TGPUKernelUniformsInterface,
    TGPUKernelMiscInfoInterface
  >
) => void;
export type GPUKernel = {
  run: (x: number, y?: number, z?: number) => void;
};

export type GPUInterfaceConstructorParams<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string
> = {
  buffers?: TBuffers[];
  uniforms?: GPUUniformSpec<TUniformName>;
  canvas?: HTMLCanvasElement;
};

export type GPUInterfaceConstructorParamsWithCPU<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string
> = GPUInterfaceConstructorParams<TBufferName, TBuffers, TUniformName> & {
  useCpu?: boolean;
};

export type GPUBufferSizeToBuffer<TSize> = TSize extends [number]
  ? number[]
  : TSize extends [number, number]
  ? number[][]
  : TSize extends [number, number, number]
  ? number[][][]
  : never;
export type GPUBufferSizeToVec<TSize> = TSize extends [number]
  ? { x: TSize[0] }
  : TSize extends [number, number]
  ? { x: TSize[0]; y: TSize[1] }
  : TSize extends [number, number, number]
  ? { x: TSize[0]; y: TSize[1]; z: TSize[2] }
  : never;
