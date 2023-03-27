import {
  GPUBufferSpecToBuffer,
  GPUBufferSizeToVec,
  GPUBufferSpec,
  GPUInterfaceConstructorParams,
  GPUKernel,
  GPUKernelSource,
  GPUUniformSpec,
  GPUBufferTypeStr,
  ExtractArrayType,
} from '../common/types';
import { getDataType } from '../common/utils';
import { GPUVec2 } from '../gpu-types/vec2';
import { GPUVec3 } from '../gpu-types/vec3';
import { GPUVec4 } from '../gpu-types/vec4';
import transpileKernelToGPU from './parser/parse-kernel';
import {
  GPUBufferCollection,
  GPUBufferTypeToType,
  GPUUniformCollection,
  GPUUniformInfo,
} from './types';
import { getFragmentSource, getVertexSource } from './wgsl-code';

export default class GPUBackend<
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
  private device?: GPUDevice;
  private bindGroup?: GPUBindGroup;
  private bindGroupLayout?: GPUBindGroupLayout;
  private bufferSpecs?: TBuffers[];
  private buffers?: GPUBufferCollection<TBufferName>;
  private uniforms?: GPUUniformCollection<TUniformName>;
  private uniformBuffer?: GPUBuffer;
  private pixelBuffer?: GPUBuffer;
  private initialized: boolean = false;
  private canvas?: HTMLCanvasElement;
  private context?: GPUCanvasContext;
  private renderPipeline?: GPURenderPipeline;
  private vertexBuffer?: GPUBuffer;
  private totalUniformOffset: number = 0;

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
    this.bufferSpecs = buffers;
    this.uniforms =
      uniforms === undefined
        ? undefined
        : Object.keys(uniforms).reduce((res, key, i) => {
            res[key] = {
              id: i,
              value: uniforms[key as TUniformName],
              offset: -1,
            } as GPUUniformInfo;
            return res;
          }, {} as any);
    this.canvas = canvas;
  }

  async initialize() {
    await this.initDevice();
    this.initBuffers();
    if (this.canvas) this.initDraw();

    this.initialized = true;

    return true;
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

    if (this.bufferSpecs) {
      this.buffers = {} as GPUBufferCollection<TBufferName>;

      for (let i = 0; i < this.bufferSpecs.length; i++) {
        const spec = this.bufferSpecs[i];

        let type = 'number' as GPUBufferTypeStr;
        if (spec.type !== undefined) {
          type = spec.type;
        } else if (spec.initialData !== undefined) {
          type = getDataType(spec.initialData.flat(3)[0]);
        }

        // else: type is number

        const bytesPerElement =
          type === 'number' ? 4 : type === 'vec2' ? 8 : 16;
        const initialData =
          'initialData' in spec ? spec.initialData : undefined;
        const buffer = this.device.createBuffer({
          size: spec.size.reduce((a, b) => a * b, 1) * bytesPerElement,
          usage:
            GPUBufferUsage.STORAGE |
            GPUBufferUsage.COPY_SRC |
            GPUBufferUsage.COPY_DST,
          mappedAtCreation: initialData ? true : false,
        });
        if (initialData) {
          const flattened = initialData.flat(3) as
            | number[]
            | GPUVec2[]
            | GPUVec3[]
            | GPUVec4[];

          const arrayBuffer = buffer.getMappedRange();
          const dataView = new Float32Array(arrayBuffer);
          if (type === 'number') {
            for (let i = 0; i < flattened.length; i++) {
              dataView[i] = flattened[i] as number;
            }
          } else if (type === 'vec2') {
            for (let i = 0; i < flattened.length; i++) {
              dataView[2 * i + 0] = (flattened[i] as GPUVec2).x;
              dataView[2 * i + 1] = (flattened[i] as GPUVec2).y;
            }
          } else if (type === 'vec3') {
            for (let i = 0; i < flattened.length; i++) {
              dataView[4 * i + 0] = (flattened[i] as GPUVec3).x;
              dataView[4 * i + 1] = (flattened[i] as GPUVec3).y;
              dataView[4 * i + 2] = (flattened[i] as GPUVec3).z;
              dataView[4 * i + 3] = 0;
            }
          } else if (type === 'vec4') {
            for (let i = 0; i < flattened.length; i++) {
              dataView[4 * i + 0] = (flattened[i] as GPUVec4).x;
              dataView[4 * i + 1] = (flattened[i] as GPUVec4).y;
              dataView[4 * i + 2] = (flattened[i] as GPUVec4).z;
              dataView[4 * i + 3] = (flattened[i] as GPUVec4).w;
            }
          }

          buffer.unmap();
        }

        this.buffers[spec.name] = {
          resource: buffer,
          id: i,
          readBuffer: undefined,
          size: spec.size,
          mapped: false,
          type,
        };
      }
    }

    if (this.uniforms) {
      let totalOffset = 0;
      for (const uniform in this.uniforms) {
        this.uniforms[uniform].offset = totalOffset;

        if (typeof this.uniforms[uniform].value === 'number') {
          totalOffset += 4;
        } else if (this.uniforms[uniform].value instanceof GPUVec2) {
          totalOffset += 4;
        } else if (this.uniforms[uniform].value instanceof GPUVec3) {
          totalOffset += 4;
        } else if (this.uniforms[uniform].value instanceof GPUVec4) {
          totalOffset += 4;
        } else {
          throw new Error(`Uniform ${uniform} has invalid type`);
        }
      }

      this.uniformBuffer = this.device.createBuffer({
        size: totalOffset * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      const uniformArrayBuffer = this.uniformBuffer.getMappedRange();
      const uniformDataView = new Float32Array(uniformArrayBuffer);
      for (const uniform in this.uniforms) {
        const value = this.uniforms[uniform].value;
        const offset = this.uniforms[uniform].offset;

        if (typeof value === 'number') {
          uniformDataView[offset] = value;
        } else if (value instanceof GPUVec2) {
          uniformDataView[offset] = value.x;
          uniformDataView[offset + 1] = value.y;
        } else if (value instanceof GPUVec3) {
          uniformDataView[offset] = value.x;
          uniformDataView[offset + 1] = value.y;
          uniformDataView[offset + 2] = value.z;
        } else {
          uniformDataView[offset] = value.x;
          uniformDataView[offset + 1] = value.y;
          uniformDataView[offset + 2] = value.z;
          uniformDataView[offset + 3] = value.w;
        }
      }
      this.uniformBuffer.unmap();

      this.totalUniformOffset = totalOffset;
    }

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

    const bindGroupLayoutEntries = [] as GPUBindGroupLayoutEntry[];
    if (this.bufferSpecs) {
      for (let i = 0; i < this.bufferSpecs?.length; i++) {
        bindGroupLayoutEntries.push({
          binding: i,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
          },
        });
      }
    }
    if (this.uniforms) {
      bindGroupLayoutEntries.push({
        binding: this.bufferSpecs ? this.bufferSpecs.length : 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: 'uniform' },
      });
    }
    if (this.canvas)
      bindGroupLayoutEntries.push({
        binding:
          (this.bufferSpecs ? this.bufferSpecs.length : 0) +
          (this.uniforms ? 1 : 0),
        visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
        buffer: { type: 'storage' },
      });
    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: bindGroupLayoutEntries,
    });

    const bindGroupEntries = [] as GPUBindGroupEntry[];
    if (this.buffers) {
      for (const bufferName in this.buffers) {
        const buffer = this.buffers[bufferName];
        bindGroupEntries.push({
          binding: buffer.id,
          resource: {
            buffer: buffer.resource,
          },
        });
      }
    }
    if (this.uniformBuffer) {
      bindGroupEntries.push({
        binding: this.bufferSpecs ? this.bufferSpecs.length : 0,
        resource: {
          buffer: this.uniformBuffer,
        },
      });
    }
    if (this.pixelBuffer)
      bindGroupEntries.push({
        binding:
          (this.bufferSpecs ? this.bufferSpecs.length : 0) +
          (this.uniforms ? 1 : 0),
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
        (this.buffers ? Object.keys(this.buffers).length : 0) +
          (this.uniforms ? 1 : 0),
        this.canvas.width,
        this.canvas.height
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

  async createKernel(
    kernel: GPUKernelSource<
      TGPUKernelBuffersInterface,
      TGPUKernelUniformsInterface
    >
  ): Promise<GPUKernel> {
    if (!this.device || !this.bindGroupLayout)
      throw new Error('GPUInterface not initialized');

    const shaderSource = transpileKernelToGPU(
      kernel,
      this.buffers,
      this.uniforms,
      this.canvas
    );

    const shaderModule = this.device.createShaderModule({
      code: shaderSource,
    });

    let compilationInfo: GPUCompilationInfo;
    if (!shaderModule.getCompilationInfo) {
      // @ts-ignore
      compilationInfo = await shaderModule.compilationInfo();
    } else {
      compilationInfo = await shaderModule.getCompilationInfo();
    }

    if (compilationInfo.messages.some(msg => msg.type === 'error')) {
      throw new Error('Unknown error during shader compilation');
    }

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
        this.buffers &&
        Object.keys(this.buffers).some(
          key => this.buffers && this.buffers[key as TBufferName].mapped
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
    if (!this.buffers) throw new Error('No buffers defined');

    const srcBuffer = this.buffers[src];
    const dstBuffer = this.buffers[dst];

    if (srcBuffer.resource.size != dstBuffer.resource.size)
      throw new Error('Buffer size mismatch');

    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(
      srcBuffer.resource,
      0,
      dstBuffer.resource,
      0,
      srcBuffer.resource.size
    );
    const gpuCommands = commandEncoder.finish();
    this.device.queue.submit([gpuCommands]);
  }

  async readBuffer(name: TBuffers['name']): Promise<Float32Array> {
    if (!this.device) throw new Error('GPUInterface not initialized');
    if (!this.buffers) throw new Error('No buffers defined');

    const buffer = this.buffers[name];
    if (!buffer.readBuffer) {
      const bytesPerElement =
        buffer.type === 'number' ? 4 : buffer.type === 'vec2' ? 8 : 16;
      buffer.readBuffer = this.device.createBuffer({
        size:
          buffer.size.reduce((a: number, b: number) => a * b, 1) *
          bytesPerElement,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });
    }

    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(
      buffer.resource,
      0,
      buffer.readBuffer,
      0,
      buffer.resource.size
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
    if (!this.device) throw new Error('GPUInterface not initialized');
    if (!this.buffers) throw new Error('No buffers defined');

    const buffer = this.buffers[name];
    if (!buffer.readBuffer || !buffer.mapped)
      throw new Error('Buffer not mapped');

    buffer.readBuffer.unmap();
    buffer.mapped = false;
  }

  setUniforms(uniforms: Partial<TUniforms>) {
    if (!this.device || !this.uniformBuffer)
      throw new Error('GPUInterface not initialized');
    if (!this.uniforms) throw new Error('No uniforms defined');

    for (const uniform of Object.keys(uniforms)) {
      this.uniforms[uniform as TUniformName].value =
        uniforms[uniform as TUniformName]!;
    }

    const uniformDataBuffer = new Float32Array(this.totalUniformOffset);
    for (const uniform in this.uniforms) {
      const value = this.uniforms[uniform].value;
      const offset = this.uniforms[uniform].offset;

      if (typeof value === 'number') {
        uniformDataBuffer[offset] = value;
      } else if (value instanceof GPUVec2) {
        uniformDataBuffer[offset] = value.x;
        uniformDataBuffer[offset + 1] = value.y;
      } else if (value instanceof GPUVec3) {
        uniformDataBuffer[offset] = value.x;
        uniformDataBuffer[offset + 1] = value.y;
        uniformDataBuffer[offset + 2] = value.z;
      } else {
        uniformDataBuffer[offset] = value.x;
        uniformDataBuffer[offset + 1] = value.y;
        uniformDataBuffer[offset + 2] = value.z;
        uniformDataBuffer[offset + 3] = value.w;
      }
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

    // this makes the error go away
    // is it slower? I don't know
    this.context.configure({
      device: this.device,
      format: 'bgra8unorm',
      alphaMode: 'opaque',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });

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
