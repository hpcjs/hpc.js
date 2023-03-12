import { GPUVec2 } from './vec2';
import { GPUVec3 } from './vec3';
import { GPUVec4 } from './vec4';

export type GPUArray<T extends number | GPUVec2 | GPUVec3 | GPUVec4> = {
  [key: number]: T;
};

export function array<T extends number | GPUVec2 | GPUVec3 | GPUVec4>(
  size: number,
  fill: T
): GPUArray<T>;
export function array<T extends number | GPUVec2 | GPUVec3 | GPUVec4>(
  data: T[]
): GPUArray<T>;

export function array<T extends number | GPUVec2 | GPUVec3 | GPUVec4>(
  sizeOrFill: number | T[],
  fill?: T
): GPUArray<T> {
  return {};
}
