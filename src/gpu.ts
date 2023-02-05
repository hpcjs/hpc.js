import { GPUBufferSpec, GPUKernel, GPUKernelSource } from './types';
import { GPUBufferCollection } from './internal-types';
import parseKernel from './parse-kernel';

export default class GPUInterface<TBufferName extends string> {
  private device: GPUDevice;
  private gpuBuffers: GPUBufferCollection = {};
  private bindGroupLayout: GPUBindGroupLayout;
  private bindGroup: GPUBindGroup;

  static async createInterface<TBufferName extends string>(
    gpuArraySpecs: GPUBufferSpec<TBufferName>[]
  ): Promise<GPUInterface<TBufferName>> {
    const entry = navigator.gpu;
    const adapter = await entry.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter found');

    const device = await adapter.requestDevice();
    return new GPUInterface(device, gpuArraySpecs);
  }

  private constructor(
    device: GPUDevice,
    gpuArraySpecs: GPUBufferSpec<TBufferName>[]
  ) {
    this.device = device;

    // Create GPU buffers for each array
    for (let i = 0; i < gpuArraySpecs.length; i++) {
      const { name, size, readable, initialData } = gpuArraySpecs[i];
      const buffer = this.device.createBuffer({
        size: size.reduce((a, b) => a * b, 1) * 4,
        usage:
          GPUBufferUsage.STORAGE | (readable ? GPUBufferUsage.COPY_SRC : 0),
        mappedAtCreation: initialData ? true : false,
      });
      if (initialData) {
        const arrayBuffer = buffer.getMappedRange();
        const dataView = new Float32Array(arrayBuffer);
        dataView.set(initialData);
        buffer.unmap();
      }

      let readBuffer: GPUBuffer | undefined = undefined;
      if (readable) {
        readBuffer = this.device.createBuffer({
          size: size.reduce((a, b) => a * b, 1) * 4,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
      }

      this.gpuBuffers[name] = { buffer, id: i, readBuffer, size };
    }

    const bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = gpuArraySpecs.map(
      (_, i) => ({
        binding: i,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'storage',
        },
      })
    );
    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: bindGroupLayoutEntries,
    });

    const bindGroupEntries = gpuArraySpecs.map((spec, i) => ({
      binding: i,
      resource: {
        buffer: this.gpuBuffers[spec.name].buffer,
      },
    }));
    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: bindGroupEntries,
    });
  }

  setData(name: string, data: Float32Array) {
    this.device.queue.writeBuffer(this.gpuBuffers[name].buffer, 0, data);
  }

  createKernel(kernel: GPUKernelSource<TBufferName>): GPUKernel {
    const shaderSource = parseKernel(kernel, this.gpuBuffers);

    const shaderModule = this.device.createShaderModule({
      code: shaderSource,
    });
    const computePipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    const runKernel = (x: number, y: number = 1, z: number = 1) => {
      const commandEncoder = this.device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(computePipeline);
      passEncoder.setBindGroup(0, this.bindGroup);
      passEncoder.dispatchWorkgroups(x, y, z);
      passEncoder.end();
      const gpuCommands = commandEncoder.finish();
      this.device.queue.submit([gpuCommands]);
    };

    return { run: runKernel };
  }

  async readBuffer(name: TBufferName): Promise<Float32Array> {
    const buffer = this.gpuBuffers[name];
    if (!buffer.readBuffer) throw new Error('Buffer not marked as readable');

    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(
      buffer.buffer,
      0,
      buffer.readBuffer,
      0,
      buffer.buffer.size
    );
    const gpuCommands = commandEncoder.finish();
    this.device.queue.submit([gpuCommands]);

    await buffer.readBuffer.mapAsync(GPUMapMode.READ);
    const readBuffer = buffer.readBuffer.getMappedRange();
    return new Float32Array(readBuffer);
  }
}
