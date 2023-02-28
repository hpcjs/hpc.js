# HPC.js

HPC.js is a library that allows you to easily write GPU-accelerated code in JavaScript, enabling the creation of physics simulations, machine learning implementations, and much more. With first-class TypeScript support and built-in graphics tools, you can get up and running with HPC.js in minutes. Knowledge of the GPU's inner workings are entirely unnecessary; all you need to know is we're using features of the web's latest API, WebGPU, to ensure your computations are delivered as quickly as possible.

For the uninitiated, we provide brief video guides that illustrate how GPU compute works, how to write your first program, and how to write a real-world application with user input.

## Example Usage

```typescript
import GPUInterface from 'hpc.js';

const gpu = new GPUInterface({
  buffers: [
    {
      name: 'mybuffer',
      size: [4],
      initialData: [1, 2, 3, 4],
    },
  ],
});

await gpu.initialize();

const kernel = gpu.createKernel(inputs => {
  const id = inputs.threadId.x;
  inputs.buffers.mybuffer[id] *= 2;
});
kernel.run(4);

const result = await gpu.readBuffer('mybuffer');
console.log(result);
```

## Documentation and Tutorials

See [https://hpcjs-docs.vercel.app](https://hpcjs-docs.vercel.app)
