import { GPUBuffer1D, GPUBuffer2D, GPUBuffer3D } from '../common/types';
import { GPUArray } from './array';
import { GPUVec2 } from './vec2';
import { GPUVec3 } from './vec3';
import { GPUVec4 } from './vec4';

export function dim(buffer: GPUBuffer1D): number;
export function dim(buffer: GPUBuffer2D): GPUVec2;
export function dim(buffer: GPUBuffer3D): GPUVec3;
export function dim<T extends number | GPUVec2 | GPUVec3 | GPUVec4>(
  array: GPUArray<T>
): number;
export function dim<T extends number | GPUVec2 | GPUVec3 | GPUVec4>(
  arrayOrBuffer: GPUArray<T> | GPUBuffer1D | GPUBuffer2D | GPUBuffer3D
): number | GPUVec2 | GPUVec3 {
  return 0;
}
