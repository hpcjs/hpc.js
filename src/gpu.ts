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
import { getFragmentSource, getVertexSource } from './wgsl-code';

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
  private pixelBuffer?: GPUBuffer;
  private initialized: boolean = false;
  private canvas?: HTMLCanvasElement;
  private context?: GPUCanvasContext;
  private renderPipeline?: GPURenderPipeline;
  private vertexBuffer?: GPUBuffer;

  get isInitialized() {
    return this.initialized;
  }

  constructor(
    gpuArraySpecs: TBuffers[],
    gpuUniformSpecs: GPUUniformSpec<TUniformName>,
    canvas?: HTMLCanvasElement
  ) {
    this.gpuArraySpecs = gpuArraySpecs;
    this.gpuUniforms = Object.keys(gpuUniformSpecs).reduce((res, key, i) => {
      res[key as TUniformName] = {
        id: i,
        value: gpuUniformSpecs[key as TUniformName],
      };
      return res;
    }, {} as any);

    if (canvas) {
      this.canvas = canvas;
    }
  }

  async initialize() {
    await this.initDevice();
    this.initBuffers();
    if (this.canvas) this.initDraw();

    this.initialized = true;
  }

  // setData(name: string, data: Float32Array) {
  //   if (!this.device) throw new Error('GPUInterface not initialized');

  //   this.device.queue.writeBuffer(this.gpuBuffers[name].buffer, 0, data);
  // }

  private async initDevice() {
    const entry = navigator.gpu;
    const adapter = await entry.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter found');

    const device = await adapter.requestDevice();
    this.device = device;
  }

  private initBuffers() {
    if (!this.device) throw new Error('GPUInterface not initialized');

    for (let i = 0; i < this.gpuArraySpecs.length; i++) {
      const { name, size, initialData } = this.gpuArraySpecs[i];
      const buffer = this.device.createBuffer({
        size: size.reduce((a, b) => a * b, 1) * 4,
        usage:
          GPUBufferUsage.STORAGE |
          GPUBufferUsage.COPY_SRC |
          GPUBufferUsage.COPY_DST,
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

      this.gpuBuffers[name] = {
        buffer,
        id: i,
        readBuffer: undefined,
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

    if (this.canvas) {
      this.pixelBuffer = this.device.createBuffer({
        size: this.canvas.width * this.canvas.height * 4 * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });
      const pixelArrayBuffer = this.pixelBuffer.getMappedRange();
      const pixelDataView = new Float32Array(pixelArrayBuffer);
      for (let i = 0; i < this.canvas.width * this.canvas.height * 4; i++) {
        pixelDataView[i * 4] = 0;
        pixelDataView[i * 4 + 1] = 0;
        pixelDataView[i * 4 + 2] = 0;
        pixelDataView[i * 4 + 3] = 1;
      }
      this.pixelBuffer.unmap();
    }

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
    if (this.canvas)
      bindGroupLayoutEntries.push({
        binding: this.gpuArraySpecs.length + 1,
        visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
        buffer: { type: 'storage' },
      });
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
    if (this.canvas && this.pixelBuffer)
      bindGroupEntries.push({
        binding: this.gpuArraySpecs.length + 1,
        resource: {
          buffer: this.pixelBuffer,
        },
      });
    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: bindGroupEntries,
    });
  }

  private initDraw() {
    if (!this.device || !this.canvas || !this.bindGroupLayout)
      throw new Error('GPUInterface not initialized');

    const context = this.canvas.getContext('webgpu');
    if (!context) throw new Error('Could not get WebGPU context');
    this.context = context;
    this.context.configure({
      device: this.device,
      format: 'bgra8unorm',
      alphaMode: 'opaque',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });

    const vertices = new Float32Array([
      -1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, 1,
    ]);

    this.vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    const vertexArrayBuffer = this.vertexBuffer.getMappedRange();
    const vertexDataView = new Float32Array(vertexArrayBuffer);
    vertexDataView.set(vertices);
    this.vertexBuffer.unmap();

    const vertexModule = this.device.createShaderModule({
      code: getVertexSource(),
    });
    const fragmentModule = this.device.createShaderModule({
      code: getFragmentSource(
        Object.keys(this.gpuBuffers).length + 1,
        this.canvas.width
      ),
    });

    const vertexAttribDesc: GPUVertexAttribute = {
      shaderLocation: 0,
      offset: 0,
      format: 'float32x2',
    };
    const vertexBufferDesc: GPUVertexBufferLayout = {
      attributes: [vertexAttribDesc],
      arrayStride: 2 * 4,
      stepMode: 'vertex',
    };

    const colorState: GPUColorTargetState = {
      format: 'bgra8unorm',
    };

    this.renderPipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      vertex: {
        module: vertexModule,
        entryPoint: 'main',
        buffers: [vertexBufferDesc],
      },
      fragment: {
        module: fragmentModule,
        entryPoint: 'main',
        targets: [colorState],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });
  }

  createKernel(
    kernel: GPUKernelSource<
      TGPUKernelBuffersInterface,
      TGPUKernelUniformsInterface
    >
  ): GPUKernel {
    if (!this.device || !this.bindGroupLayout)
      throw new Error('GPUInterface not initialized');

    const shaderSource = parseKernel(
      kernel,
      this.gpuBuffers,
      this.gpuUniforms,
      this.canvas ? [this.canvas.width, this.canvas.height] : undefined
    );

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

  copyBuffer(src: TBuffers['name'], dst: TBuffers['name']) {
    if (!this.device) throw new Error('GPUInterface not initialized');
    const srcBuffer = this.gpuBuffers[src];
    const dstBuffer = this.gpuBuffers[dst];

    if (srcBuffer.buffer.size != dstBuffer.buffer.size)
      throw new Error('Buffer size mismatch');

    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(
      srcBuffer.buffer,
      0,
      dstBuffer.buffer,
      0,
      srcBuffer.buffer.size
    );
    const gpuCommands = commandEncoder.finish();
    this.device.queue.submit([gpuCommands]);
  }

  async readBuffer(name: TBuffers['name']): Promise<Float32Array> {
    if (!this.device) throw new Error('GPUInterface not initialized');

    const buffer = this.gpuBuffers[name];
    if (!buffer.readBuffer) {
      buffer.readBuffer = this.device.createBuffer({
        size: buffer.size.reduce((a, b) => a * b, 1) * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });
    }

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
    if (!buffer.readBuffer || !buffer.mapped)
      throw new Error('Buffer not mapped');

    buffer.readBuffer.unmap();
    buffer.mapped = false;
  }

  setUniforms(uniforms: { [K in TUniformName]?: number }) {
    if (!this.device || !this.uniformBuffer)
      throw new Error('GPUInterface not initialized');

    for (const uniform in uniforms) {
      this.gpuUniforms[uniform].value = uniforms[uniform] as number;
    }

    const uniformDataBuffer = new Float32Array(
      Object.keys(this.gpuUniforms).length
    );
    for (const uniform in this.gpuUniforms) {
      const id = this.gpuUniforms[uniform].id;
      uniformDataBuffer[id] = this.gpuUniforms[uniform].value;
    }
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformDataBuffer);
  }

  updateCanvas() {
    if (
      !this.device ||
      !this.context ||
      !this.renderPipeline ||
      !this.vertexBuffer ||
      !this.bindGroup
    )
      throw new Error('GPUInterface not initialized');

    const colorTexture = this.context.getCurrentTexture();
    const colorTextureView = colorTexture.createView();

    const colorAttachment: GPURenderPassColorAttachment = {
      view: colorTextureView,
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: 'clear',
      storeOp: 'store',
    };

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
    };

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
    passEncoder.setPipeline(this.renderPipeline);
    passEncoder.setVertexBuffer(0, this.vertexBuffer);
    passEncoder.setBindGroup(0, this.bindGroup);
    passEncoder.draw(6);
    passEncoder.end();

    const gpuCommands = commandEncoder.finish();
    this.device.queue.submit([gpuCommands]);
  }
}
