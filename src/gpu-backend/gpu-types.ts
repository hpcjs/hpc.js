import { GPUBufferSize } from '../common/common-types';
import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';

export type GPUBufferWithInfo = {
  size: GPUBufferSize;
  resource: GPUBuffer;
  id: number;
  readBuffer?: GPUBuffer;
  mapped: boolean;
  type: 'number' | 'vec2' | 'vec3' | 'vec4';
};
export type GPUUniformInfo = {
  value: number | GPUVec2 | GPUVec3 | GPUVec4;
  offset: number;
};

export type GPUBufferCollection<TName extends string> = {
  [K in TName]: GPUBufferWithInfo;
};
export type GPUUniformCollection<TName extends string> = {
  [K in TName]: GPUUniformInfo;
};
