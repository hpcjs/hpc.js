import {
  GPUBuffer1D,
  GPUBuffer2D,
  GPUBuffer3D,
  GPUBufferType,
} from '../common/types';
import { GPUArray } from './array';
import { GPUVec2 } from './vec2';
import { GPUVec3 } from './vec3';
import { GPUVec4 } from './vec4';

export function dim<T extends GPUBufferType>(buffer: GPUBuffer1D<T>): number;
export function dim<T extends GPUBufferType>(buffer: GPUBuffer2D<T>): GPUVec2;
export function dim<T extends GPUBufferType>(buffer: GPUBuffer3D<T>): GPUVec3;
export function dim<T extends number | GPUVec2 | GPUVec3 | GPUVec4>(
  array: GPUArray<T>
): number;
export function dim<
  T extends number | GPUVec2 | GPUVec3 | GPUVec4,
  U extends GPUBufferType
>(
  arrayOrBuffer: GPUArray<T> | GPUBuffer1D<U> | GPUBuffer2D<U> | GPUBuffer3D<U>
): number | GPUVec2 | GPUVec3 {
  return 0;
}
