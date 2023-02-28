import {
  GPUBufferSizeToBuffer,
  GPUBufferSpec,
  GPUInterfaceConstructorParams,
  GPUInterfaceConstructorParamsWithCPU,
  GPUKernel,
  GPUKernelSource,
  GPUUniformSpec,
} from './common/types';
import CPUFallback from './cpu-backend/backend';
import GPUBackend from './gpu-backend/backend';

type CombinedBackend<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string
> =
  | GPUBackend<TBufferName, TBuffers, TUniformName>
  | CPUFallback<TBufferName, TBuffers, TUniformName>;

export default class GPUInterface<
  TBufferName extends string,
  TBuffers extends GPUBufferSpec<TBufferName>,
  TUniformName extends string,
  TGPUKernelBuffersInterface = {
    [K in TBuffers['name']]: TBuffers extends { name: K }
      ? GPUBufferSizeToBuffer<TBuffers['size']>
      : never;
  },
  TGPUKernelUniformsInterface = { [K in TUniformName]: number }
> {
  backend: CombinedBackend<TBufferName, TBuffers, TUniformName>;
  bufferSpecs?: TBuffers[];
  uniformSpec?: GPUUniformSpec<TUniformName>;
  canvas?: HTMLCanvasElement;
  useCPU: boolean;

  get isInitialized() {
    return this.backend.isInitialized;
  }

  constructor({
    buffers = undefined,
    uniforms = undefined,
    canvas = undefined,
    useCPU = false,
  }: GPUInterfaceConstructorParamsWithCPU<
    TBufferName,
    TBuffers,
    TUniformName
  >) {
    this.bufferSpecs = buffers;
    this.uniformSpec = uniforms;
    this.canvas = canvas;
    this.useCPU = useCPU;

    this.backend = new GPUBackend({ buffers, uniforms, canvas });
  }

  async initialize() {
    if (this.backend instanceof CPUFallback) {
      return;
    }

    let success: boolean;
    if (this.useCPU) {
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
  }

  // setData(name: string, data: Float32Array) {
  //   if (!this.device) throw new Error('GPUInterface not initialized');

  //   this.device.queue.writeBuffer(this.gpuBuffers[name].buffer, 0, data);
  // }

  createKernel(
    kernel: GPUKernelSource<
      TGPUKernelBuffersInterface,
      TGPUKernelUniformsInterface
    >
  ): GPUKernel {
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

  setUniforms(uniforms: { [K in TUniformName]?: number }) {
    this.backend.setUniforms(uniforms);
  }

  updateCanvas() {
    this.backend.updateCanvas();
  }
}
