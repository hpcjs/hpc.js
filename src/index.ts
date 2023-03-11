import GPUInterface from './gpu';
import { GPUKernel } from './common/types';
import GPUVec2, { vec2 } from './gpu-types/vec2';
import GPUVec3, { vec3 } from './gpu-types/vec3';
import GPUVec4, { vec4 } from './gpu-types/vec4';
import { GPUArray, array } from './gpu-types/array';

export default GPUInterface;
export { vec2, GPUVec2 };
export { vec3, GPUVec3 };
export { vec4, GPUVec4 };
export { array, GPUArray };
export type { GPUKernel };
