import {
  GPUBufferSizeToBuffer,
  GPUBufferSizeToVec,
  GPUBufferSpec,
  GPUInterfaceConstructorParamsWithCPU,
  GPUKernel,
  GPUKernelSource,
  GPUUniformSpec,
} from './common/types';
import CPUFallback from './cpu-backend/backend';
import GPUBackend from './gpu-backend/backend';
import { GPUVec2 } from './gpu-types/vec2';
import { GPUVec3 } from './gpu-types/vec3';
import { GPUVec4 } from './gpu-types/vec4';

type CombinedBackend<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string,
  TUniforms extends GPUUniformSpec<TUniformName>
> =
  | GPUBackend<TBufferName, TBuffers, TUniformName, TUniforms>
  | CPUFallback<TBufferName, TBuffers, TUniformName, TUniforms>;

export default class GPUInterface<
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
  backend: CombinedBackend<TBufferName, TBuffers, TUniformName, TUniforms>;
  bufferSpecs?: TBuffers[];
  uniformSpec?: GPUUniformSpec<TUniformName>;
  canvas?: HTMLCanvasElement;
  useCpu: boolean;

  get isInitialized() {
    return this.backend.isInitialized;
  }

  get backendType() {
    if (!this.isInitialized) {
      return 'uninitialized';
    } else if (this.backend instanceof CPUFallback) {
      return 'cpu';
    } else {
      return 'gpu';
    }
  }

  constructor({
    buffers = undefined,
    uniforms = undefined,
    canvas = undefined,
    useCpu = false,
  }: GPUInterfaceConstructorParamsWithCPU<
    TBufferName,
    TBuffers,
    TUniformName,
    TUniforms
  >) {
    this.bufferSpecs = buffers;
    this.uniformSpec = uniforms;
    this.canvas = canvas;
    this.useCpu = useCpu;

    this.backend = new GPUBackend({ buffers, uniforms, canvas });
  }

  async initialize() {
    if (this.backend instanceof CPUFallback) {
      return;
    }

    let success: boolean;
    if (this.useCpu) {
      success = false;
    } else {
      success = await this.backend.initialize();
    }

    if (!success) {
      this.backend = new CPUFallback({
        buffers: this.bufferSpecs,
        uniforms: this.uniformSpec,
        canvas: this.canvas,
      });
    }

    return this;
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
    // can't be bothered to figure out typing for this
    return this.backend.createKernel(kernel as any);
  }

  copyBuffer(src: TBuffers['name'], dst: TBuffers['name']) {
    this.backend.copyBuffer(src, dst);
  }

  async readBuffer(name: TBuffers['name']): Promise<Float32Array> {
    return this.backend.readBuffer(name);
  }

  unmapBuffer(name: TBuffers['name']) {
    if (this.backend instanceof GPUBackend) {
      this.backend.unmapBuffer(name);
    }
  }

  setUniforms(uniforms: Partial<TUniforms>) {
    this.backend.setUniforms(uniforms);
  }

  updateCanvas() {
    this.backend.updateCanvas();
  }
}
