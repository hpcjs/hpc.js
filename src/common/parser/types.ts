import { GPUVec2 } from '../../gpu-types/vec2';
import { GPUVec3 } from '../../gpu-types/vec3';
import { GPUVec4 } from '../../gpu-types/vec4';
import { GPUBufferSize } from '../types';

export type WalkerStateBufferCollection<TName extends string> = {
  [K in TName]: WalkerStateBuffer;
};

export type WalkerStateBuffer = {
  size: GPUBufferSize;
  type: 'number' | 'vec2' | 'vec3' | 'vec4';
};

export type WalkerStateUniformCollection<TName extends string> = {
  [K in TName]: WalkerStateUniform;
};

export type WalkerStateUniform = {
  value: number | GPUVec2 | GPUVec3 | GPUVec4;
};
