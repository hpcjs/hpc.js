import {
  GPUBufferSizeToBuffer,
  GPUBufferSizeToVec,
  GPUBufferSpec,
  GPUInterfaceConstructorParams,
  GPUKernel,
  GPUKernelSource,
  GPUUniformSpec,
} from '../common/types';
import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';
import transpileKernelToCPU from './parse-kernel';
import { CPUBufferCollection, CPUUniformCollection } from './types';

export default class CPUFallback<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string,
  TUniforms extends GPUUniformSpec<TUniformName>,
  TGPUKernelBuffersInterface = {
    [K in TBuffers['name']]: TBuffers extends { name: K }
      ? GPUBufferSizeToBuffer<TBuffers['size']>
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
        const data = new Float32Array(buffer.size.reduce((a, b) => a * b, 1));
        if (buffer.initialData) {
          data.set(buffer.initialData.flat(3));
        }

        this.buffers[buffer.name] = {
          size: buffer.size,
          resource: data,
        };
      }
    }

    if (uniforms) {
      this.uniforms = {} as CPUUniformCollection<TUniformName>;

      for (const uniform in uniforms) {
        // @ts-ignore
        this.uniforms[uniform] = uniforms[uniform];
      }
    }

    if (canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d')!;
      this.pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
    }

    this.initialized = true;
  }

  // setData(name: string, data: Float32Array) {
  //   if (!this.device) throw new Error('GPUInterface not initialized');

  //   this.device.queue.writeBuffer(this.gpuBuffers[name].buffer, 0, data);
  // }

  async createKernel(
    kernel: GPUKernelSource<
      TGPUKernelBuffersInterface,
      TGPUKernelUniformsInterface
    >
  ): Promise<GPUKernel> {
    const runKernel = transpileKernelToCPU(
      kernel,
      this.buffers,
      this.uniforms,
      this.canvas,
      this.pixels
    );

    return { run: runKernel };
  }

  copyBuffer(src: TBuffers['name'], dst: TBuffers['name']) {
    if (!this.buffers) throw new Error('No buffers defined');

    const srcBuffer = this.buffers[src];
    const dstBuffer = this.buffers[dst];

    if (srcBuffer.resource.length != dstBuffer.resource.length)
      throw new Error('Buffer size mismatch');

    dstBuffer.resource.set(srcBuffer.resource);
  }

  async readBuffer(name: TBuffers['name']): Promise<Float32Array> {
    if (!this.buffers) throw new Error('No buffers defined');

    const buffer = this.buffers[name];
    return buffer.resource;
  }

  setUniforms(uniforms: Partial<TUniforms>) {
    if (!this.uniforms) throw new Error('No uniforms defined');

    for (const uniform of Object.keys(uniforms)) {
      // @ts-ignore
      this.uniforms[uniform as TUniformName] =
        uniforms[uniform as TUniformName]!;
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
