import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';
import { GPUBufferSpec } from './gpubufferspec';

export type GPUBufferTypeStr = 'number' | 'vec2' | 'vec3' | 'vec4';
export type GPUBufferType = number | GPUVec2 | GPUVec3 | GPUVec4;
export type { GPUBufferSpec };

export type ExtractArrayType<T> = T extends (infer U)[]
  ? ExtractArrayType<U>
  : T;

export type GPUBufferSize =
  | [number]
  | [number, number]
  | [number, number, number];

export type GPUUniformSpec<TName extends string> = {
  [K in TName]: number | GPUVec2 | GPUVec3 | GPUVec4;
};

export type GPUKernelInputs<
  TGPUKernelBuffersInterface,
  TGPUKernelUniformsInterface
> = {
  threadId: GPUVec3;
  buffers: TGPUKernelBuffersInterface;
  uniforms: TGPUKernelUniformsInterface;
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

export type GPUBuffer1D<TType extends number | GPUVec2 | GPUVec3 | GPUVec4> = {
  [key: number]: TType;
};
export type GPUBuffer2D<TType extends number | GPUVec2 | GPUVec3 | GPUVec4> = {
  [key: number]: GPUBuffer1D<TType>;
};
export type GPUBuffer3D<TType extends number | GPUVec2 | GPUVec3 | GPUVec4> = {
  [key: number]: GPUBuffer2D<TType>;
};

export type GPUBufferSpecToBuffer<
  TSize,
  TType extends number | GPUVec2 | GPUVec3 | GPUVec4
> = TSize extends [number]
  ? GPUBuffer1D<TType>
  : TSize extends [number, number]
  ? GPUBuffer2D<TType>
  : TSize extends [number, number, number]
  ? GPUBuffer3D<TType>
  : never;
export type GPUBufferSizeToVec<TSize> = TSize extends [number]
  ? { x: TSize[0] }
  : TSize extends [number, number]
  ? { x: TSize[0]; y: TSize[1] }
  : TSize extends [number, number, number]
  ? { x: TSize[0]; y: TSize[1]; z: TSize[2] }
  : never;
