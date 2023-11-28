import { transpileKernelToJs } from '../common/parser/parse-kernel';
import {
  ExtractArrayType,
  GPUBufferSpec,
  GPUBufferSpecToBuffer,
  GPUBufferTypeStr,
  GPUInterfaceConstructorParams,
  GPUKernel,
  GPUKernelSource,
  GPUUniformSpec,
  GPUBufferTypeToType,
} from '../common/types';
import { strideFromType } from '../common/utils';
import { GPUVec2, vec2 } from '../gpu-types/vec2';
import { GPUVec3, vec3 } from '../gpu-types/vec3';
import { GPUVec4, vec4 } from '../gpu-types/vec4';
// import transpileKernelToCPU from './parse-kernel';
import { CPUBufferCollection, CPUUniformCollection } from './types';

export default class CPUFallback<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string,
  TUniforms extends GPUUniformSpec<TUniformName>,
  TGPUKernelBuffersInterface = {
    [K in TBuffers['name']]: TBuffers extends { name: K }
      ? GPUBufferSpecToBuffer<
          TBuffers['size'],
          TBuffers extends { type: GPUBufferTypeStr }
            ? GPUBufferTypeToType<TBuffers['type']>
            : TBuffers extends { initialData: any[] }
            ? ExtractArrayType<TBuffers['initialData']>
            : number
        >
      : never;
  },
  TGPUKernelUniformsInterface = TUniforms
> {
  private buffers?: CPUBufferCollection<TBufferName>;
  private uniforms?: CPUUniformCollection<TUniformName>;
  private initialized: boolean = false;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private pixels?: Uint8ClampedArray;

  get isInitialized() {
    return this.initialized;
  }

  constructor({
    buffers = undefined,
    uniforms = undefined,
    canvas = undefined,
  }: GPUInterfaceConstructorParams<
    TBufferName,
    TBuffers,
    TUniformName,
    TUniforms
  >) {
    if (buffers) {
      this.buffers = {} as CPUBufferCollection<TBufferName>;

      for (const buffer of buffers) {
        let type: GPUBufferTypeStr;
        let flattened: (number | GPUVec2 | GPUVec3 | GPUVec4)[] = [];

        if (buffer.type) {
          type = buffer.type;
        } else if (buffer.initialData) {
          flattened = buffer.initialData.flat(3);
          type =
            typeof flattened[0] === 'number' ? 'number' : flattened[0].type;
        } else {
          type = 'number';
        }

        const numComponents = strideFromType(type);
        const data = new Float32Array(
          numComponents * buffer.size.reduce((a, b) => a * b, 1)
        );

        if (buffer.initialData) {
          if (flattened.length === 0) flattened = buffer.initialData.flat(3);
          if (type === 'number') {
            data.set(flattened as number[]);
          } else {
            for (let i = 0; i < flattened.length; i++) {
              if (type === 'vec2') {
                data[2 * i + 0] = (flattened[i] as GPUVec2).x;
                data[2 * i + 1] = (flattened[i] as GPUVec2).y;
              } else if (type === 'vec3') {
                data[4 * i + 0] = (flattened[i] as GPUVec3).x;
                data[4 * i + 1] = (flattened[i] as GPUVec3).y;
                data[4 * i + 2] = (flattened[i] as GPUVec3).z;
              } else if (type === 'vec4') {
                data[4 * i + 0] = (flattened[i] as GPUVec4).x;
                data[4 * i + 1] = (flattened[i] as GPUVec4).y;
                data[4 * i + 2] = (flattened[i] as GPUVec4).z;
                data[4 * i + 3] = (flattened[i] as GPUVec4).w;
              }
            }
          }
        }

        this.buffers[buffer.name] = {
          size: buffer.size,
          type: type,
          data: data,
        };
      }
    }

    if (uniforms) {
      this.uniforms = {} as CPUUniformCollection<TUniformName>;

      for (const uniform in uniforms) {
        // @ts-ignore
        this.uniforms[uniform] = { value: uniforms[uniform] };
      }
    }

    if (canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d')!;
      this.pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
      for (let i = 3; i < this.pixels.length; i += 4) {
        this.pixels[i] = 255;
      }
    }

    this.initialized = true;
  }

  async createKernel(
    kernel: GPUKernelSource<
      TGPUKernelBuffersInterface,
      TGPUKernelUniformsInterface
    >
  ): Promise<GPUKernel> {
    const transpiledSrc = transpileKernelToJs(
      kernel,
      this.buffers,
      this.uniforms,
      this.canvas
    );
    const compiled = new Function(
      'hpc__buffers',
      'hpc__uniforms',
      'hpc__pixels',
      'vec2',
      'vec3',
      'vec4',
      'hpc__dispatchSize',
      transpiledSrc
    );
    const runKernel = (x: number, y: number = 1, z: number = 1) => {
      compiled(
        this.buffers,
        this.uniforms,
        this.pixels,
        vec2,
        vec3,
        vec4,
        new GPUVec3(x, y, z)
      );
    };

    return { run: runKernel, source: transpiledSrc };
  }

  copyBuffer(src: TBuffers['name'], dst: TBuffers['name']) {
    if (!this.buffers) throw new Error('No buffers defined');

    const srcBuffer = this.buffers[src];
    const dstBuffer = this.buffers[dst];

    if (srcBuffer.data.length != dstBuffer.data.length)
      throw new Error('Buffer size mismatch');

    dstBuffer.data.set(srcBuffer.data);
  }

  async readBuffer(name: TBuffers['name']): Promise<Float32Array> {
    if (!this.buffers) throw new Error('No buffers defined');

    const buffer = this.buffers[name];
    return buffer.data;
  }

  setUniforms(uniforms: Partial<TUniforms>) {
    if (!this.uniforms) throw new Error('No uniforms defined');

    for (const uniform of Object.keys(uniforms)) {
      this.uniforms[uniform as TUniformName] = {
        value: uniforms[uniform as TUniformName]!,
      };
    }
  }

  updateCanvas() {
    if (!this.canvas || !this.context || !this.pixels)
      throw new Error('No canvas defined');

    const imageData = new ImageData(
      this.pixels,
      this.canvas.width,
      this.canvas.height
    );
    this.context.putImageData(imageData, 0, 0);
  }
}
