import { XOR } from 'ts-xor';
import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';

// TODO
// this type is big and slow
export type GPUBufferSpec<TName extends string> = XOR<
  | {
      name: TName;
      size: [number];
      initialData?: number[] | GPUVec2[] | GPUVec3[] | GPUVec4[];
    }
  | {
      name: TName;
      size: [number, number];
      initialData?: number[][] | GPUVec2[][] | GPUVec3[][] | GPUVec4[][];
    }
  | {
      name: TName;
      size: [number, number, number];
      initialData?:
        | number[][][]
        | GPUVec2[][][]
        | GPUVec3[][][]
        | GPUVec4[][][];
    },
  XOR<
    XOR<
      | {
          name: TName;
          type: 'number';
          size: [number];
          initialData?: number[];
        }
      | {
          name: TName;
          type: 'number';
          size: [number, number];
          initialData?: number[][];
        }
      | {
          name: TName;
          type: 'number';
          size: [number, number, number];
          initialData?: number[][][];
        },
      | {
          name: TName;
          type: 'vec2';
          size: [number];
          initialData?: GPUVec2[];
        }
      | {
          name: TName;
          type: 'vec2';
          size: [number, number];
          initialData?: GPUVec2[][];
        }
      | {
          name: TName;
          type: 'vec2';
          size: [number, number, number];
          initialData?: GPUVec2[][][];
        }
    >,
    XOR<
      | {
          name: TName;
          type: 'vec3';
          size: [number];
          initialData?: GPUVec3[];
        }
      | {
          name: TName;
          type: 'vec3';
          size: [number, number];
          initialData?: GPUVec3[][];
        }
      | {
          name: TName;
          type: 'vec3';
          size: [number, number, number];
          initialData?: GPUVec3[][][];
        },
      | {
          name: TName;
          type: 'vec4';
          size: [number];
          initialData?: GPUVec4[];
        }
      | {
          name: TName;
          type: 'vec4';
          size: [number, number];
          initialData?: GPUVec4[][];
        }
      | {
          name: TName;
          type: 'vec4';
          size: [number, number, number];
          initialData?: GPUVec4[][][];
        }
    >
  >
>;
