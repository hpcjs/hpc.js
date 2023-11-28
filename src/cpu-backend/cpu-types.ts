import { GPUBufferSize } from '../common/common-types';
import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';

export type CPUBufferWithInfo = {
  size: GPUBufferSize;
  type: 'number' | 'vec2' | 'vec3' | 'vec4';
  data: Float32Array;
};

export type CPUUniformInfo = {
  value: number | GPUVec2 | GPUVec3 | GPUVec4;
};

export type CPUBufferCollection<TName extends string> = {
  [K in TName]: CPUBufferWithInfo;
};

export type CPUUniformCollection<TName extends string> = {
  [K in TName]: CPUUniformInfo;
};
