export const getJsSetPixelSource = (width: number, height: number) => {
  return `function hpc__setPixelv1(x, y, r, g, b) {
    const index = (Math.round(${height} - y) * ${width} + Math.round(x)) * 4;
    hpc__pixels[index + 0] = r;
    hpc__pixels[index + 1] = g;
    hpc__pixels[index + 2] = b;
}

function hpc__setPixelv2(pos, r, g, b) {
    const index = (Math.round(${height} - pos.y) * ${width} + Math.round(pos.x)) * 4;
    hpc__pixels[index + 0] = r;
    hpc__pixels[index + 1] = g;
    hpc__pixels[index + 2] = b;
}

function hpc__setPixelv3(x, y, color) {
    const index = (Math.round(${height} - y) * ${width} + Math.round(x)) * 4;
    hpc__pixels[index + 0] = color.x;
    hpc__pixels[index + 1] = color.y;
    hpc__pixels[index + 2] = color.z;
}

function hpc__setPixelv4(pos, color) {
    const index = (Math.round(${height} - pos.y) * ${width} + Math.round(pos.x)) * 4;
    hpc__pixels[index + 0] = color.x;
    hpc__pixels[index + 1] = color.y
    hpc__pixels[index + 2] = color.z;
}\n\n`;
};

export const getJsProxySource = (name: string, type: string) => {
  return `const hpc__bufferProxy_${name} = new Proxy(hpc__buffers.${name}.data, {
    get(target, index) {
        ${
          type === 'number'
            ? 'return target[index];'
            : type === 'vec2'
            ? 'return vec2(target[index * 2], target[index * 2 + 1]);'
            : type === 'vec3'
            ? 'return vec3(target[index * 3], target[index * 3 + 1], target[index * 3 + 2]);'
            : 'return vec4(target[index * 4], target[index * 4 + 1], target[index * 4 + 2], target[index * 4 + 3]);'
        }
    },
    set(target, index, value) {
        ${
          type === 'number'
            ? 'target[index] = value;'
            : type === 'vec2'
            ? 'target[index * 2] = value.x;\n        target[index * 2 + 1] = value.y;'
            : type === 'vec3'
            ? 'target[index * 3] = value.x;\n        target[index * 3 + 1] = value.y;\n        target[index * 3 + 2] = value.z;'
            : 'target[index * 4] = value.x;\n        target[index * 4 + 1] = value.y;\n        target[index * 4 + 2] = value.z;\n        target[index * 4 + 3] = value.w;'
        }
        return true;
    }
});\n\n`;
};
