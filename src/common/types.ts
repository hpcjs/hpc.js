import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';

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
export type GPUUniformSpec<TName extends string> = {
  [K in TName]: number | GPUVec2 | GPUVec3 | GPUVec4;
};

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
  canvas: {
    size: GPUVec2;
    setPixel: ((
      x: number,
      y: number,
      r: number,
      g: number,
      b: number
    ) => void) &
      ((x: number, y: number, color: GPUVec3) => void) &
      ((pos: GPUVec2, r: number, g: number, b: number) => void) &
      ((pos: GPUVec2, color: GPUVec3) => void);
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
  TUniformName extends string,
  TUniforms extends GPUUniformSpec<TUniformName>
> = {
  buffers?: TBuffers[];
  uniforms?: TUniforms;
  canvas?: HTMLCanvasElement;
};

export type GPUInterfaceConstructorParamsWithCPU<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string,
  TUniforms extends GPUUniformSpec<TUniformName>
> = GPUInterfaceConstructorParams<
  TBufferName,
  TBuffers,
  TUniformName,
  TUniforms
> & {
  useCpu?: boolean;
};

export type GPUBuffer1D = { [key: number]: number };
export type GPUBuffer2D = { [key: number]: { [key: number]: number } };
export type GPUBuffer3D = {
  [key: number]: { [key: number]: { [key: number]: number } };
};

export type GPUBufferSizeToBuffer<TSize> = TSize extends [number]
  ? GPUBuffer1D
  : TSize extends [number, number]
  ? GPUBuffer2D
  : TSize extends [number, number, number]
  ? GPUBuffer3D
  : never;
export type GPUBufferSizeToVec<TSize> = TSize extends [number]
  ? { x: TSize[0] }
  : TSize extends [number, number]
  ? { x: TSize[0]; y: TSize[1] }
  : TSize extends [number, number, number]
  ? { x: TSize[0]; y: TSize[1]; z: TSize[2] }
  : never;
