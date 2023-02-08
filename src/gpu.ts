import {
  GPUBufferSpec,
  GPUKernel,
  GPUKernelSource,
  GPUUniformSpec,
} from './types';
import {
  GPUBufferCollection,
  GPUBufferSizeToBuffer,
  GPUUniformCollection,
} from './internal-types';
import parseKernel from './parse-kernel';

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
  private device?: GPUDevice;
  private bindGroup?: GPUBindGroup;
  private bindGroupLayout?: GPUBindGroupLayout;
  private gpuArraySpecs: TBuffers[];
  private gpuBuffers: GPUBufferCollection<TBufferName> = {} as any;
  private gpuUniforms: GPUUniformCollection<TUniformName> = {} as any;
  private uniformBuffer?: GPUBuffer;

  constructor(
    gpuArraySpecs: TBuffers[],
    gpuUniformSpecs: GPUUniformSpec<TUniformName>
  ) {
    this.gpuArraySpecs = gpuArraySpecs;
    this.gpuUniforms = Object.keys(gpuUniformSpecs).reduce((res, key, i) => {
      res[key as TUniformName] = {
        id: i,
        value: gpuUniformSpecs[key as TUniformName],
      };
      return res;
    }, {} as any);
  }

  async initialize() {
    const entry = navigator.gpu;
    const adapter = await entry.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter found');

    const device = await adapter.requestDevice();
    this.device = device;

    for (let i = 0; i < this.gpuArraySpecs.length; i++) {
      const { name, size, readable, initialData } = this.gpuArraySpecs[i];
      const buffer = this.device.createBuffer({
        size: size.reduce((a, b) => a * b, 1) * 4,
        usage:
          GPUBufferUsage.STORAGE | (readable ? GPUBufferUsage.COPY_SRC : 0),
        mappedAtCreation: initialData ? true : false,
      });
      if (initialData) {
        const flattened: number[] = [];
        for (const entry1 of initialData) {
          if (typeof entry1 !== 'number') {
            for (const entry2 of entry1) {
              if (typeof entry2 !== 'number') {
                for (const entry3 of entry2) {
                  flattened.push(entry3);
                }
              } else {
                flattened.push(entry2);
              }
            }
          } else {
            flattened.push(entry1);
          }
        }

        const arrayBuffer = buffer.getMappedRange();
        const dataView = new Float32Array(arrayBuffer);
        dataView.set(flattened);
        buffer.unmap();
      }

      let readBuffer: GPUBuffer | undefined = undefined;
      if (readable) {
        readBuffer = this.device.createBuffer({
          size: size.reduce((a, b) => a * b, 1) * 4,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
      }

      this.gpuBuffers[name] = {
        buffer,
        id: i,
        readBuffer,
        size,
        mapped: false,
      };
    }

    this.uniformBuffer = this.device.createBuffer({
      size: Object.keys(this.gpuUniforms).length * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    const uniformArrayBuffer = this.uniformBuffer.getMappedRange();
    const uniformDataView = new Float32Array(uniformArrayBuffer);
    for (const uniform in this.gpuUniforms) {
      const id = this.gpuUniforms[uniform].id;
      uniformDataView[id] = this.gpuUniforms[uniform].value;
    }
    this.uniformBuffer.unmap();

    const bindGroupLayoutEntries = this.gpuArraySpecs
      .map((_, i) => ({
        binding: i,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'storage',
        },
      }))
      .concat([
        {
          binding: this.gpuArraySpecs.length,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
      ]) as GPUBindGroupLayoutEntry[];
    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: bindGroupLayoutEntries,
    });

    const bindGroupEntries = this.gpuArraySpecs
      .map((spec, i) => ({
        binding: i,
        resource: {
          buffer: this.gpuBuffers[spec.name].buffer,
        },
      }))
      .concat([
        {
          binding: this.gpuArraySpecs.length,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
      ]);
    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: bindGroupEntries,
    });
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
    if (!this.device || !this.bindGroupLayout)
      throw new Error('GPUInterface not initialized');

    const shaderSource = parseKernel(kernel, this.gpuBuffers, this.gpuUniforms);

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
      if (!this.device || !this.bindGroup)
        throw new Error('GPUInterface not initialized');
      if (
        Object.keys(this.gpuBuffers).some(
          key => this.gpuBuffers[key as TBufferName].mapped
        )
      )
        throw new Error('Buffer is mapped');

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

  async readBuffer(name: TBuffers['name']): Promise<Float32Array> {
    if (!this.device) throw new Error('GPUInterface not initialized');

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
    buffer.mapped = true;

    const readBuffer = buffer.readBuffer.getMappedRange();
    const dataView = new Float32Array(readBuffer);
    return dataView;
  }

  unmapBuffer(name: TBuffers['name']) {
    const buffer = this.gpuBuffers[name];
    if (!buffer.readBuffer) throw new Error('Buffer not marked as readable');
    if (!buffer.mapped) throw new Error('Buffer not mapped');

    buffer.readBuffer.unmap();
    buffer.mapped = false;
  }

  setUniforms(uniforms: { [K in TUniformName]?: number }) {
    if (!this.device || !this.uniformBuffer)
      throw new Error('GPUInterface not initialized');

    Object.assign(this.gpuUniforms, uniforms);

    const uniformDataBuffer = new Float32Array(
      Object.keys(this.gpuUniforms).length
    );
    for (const uniform in this.gpuUniforms) {
      const id = this.gpuUniforms[uniform].id;
      uniformDataBuffer[id] = this.gpuUniforms[uniform].value;
    }
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformDataBuffer);
  }
}
