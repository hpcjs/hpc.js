export const getSetPixelSource = (width: number) => {
  return /* wgsl */ `fn setPixelv1(x: f32, y: f32, r: f32, g: f32, b: f32) {
  let index = i32(y) * ${width} + i32(x);
  pixels.data[index] = vec3<f32>(r / 255, g / 255, b / 255);
}

fn setPixelv2(pos: vec2<f32>, r: f32, g: f32, b: f32) {
  let index = i32(pos.y) * ${width} + i32(pos.x);
  pixels.data[index] = vec3<f32>(r / 255, g / 255, b / 255);
}

fn setPixelv3(x: f32, y: f32, color: vec3<f32>) {
  let index = i32(y) * ${width} + i32(x);
  pixels.data[index] = color / 255;
}

fn setPixelv4(pos: vec2<f32>, color: vec3<f32>) {
  let index = i32(pos.y) * ${width} + i32(pos.x);
  pixels.data[index] = color / 255;
}`;
};

export const getCplxSource = () => {
  return /* wgsl */ `fn cplxTimes(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

fn cplxDiv(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    a.x * b.x + a.y * b.y,
    a.y * b.x - a.x * b.y
  ) / dot(b, b);
}

fn cplxConj(a: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(a.x, -a.y);
}`;
};

export const getVertexSource = () => {
  return /* wgsl */ `
  struct VSOut {
    @builtin(position) Position : vec4<f32>
  }

  @vertex
  fn main(@location(0) inPos: vec2<f32>) -> VSOut {
    var vsOut: VSOut;
    vsOut.Position = vec4<f32>(inPos, 0, 1);
    return vsOut;
  }
`;
};

export const getFragmentSource = (
  pixelBufferIndex: number,
  screenWidth: number,
  screenHeight: number
) => {
  return /* wgsl */ `
  struct PixelData {
    data: array<vec3<f32>>
  }

  @group(0) @binding(${pixelBufferIndex}) var<storage, read_write> pixels: PixelData;

  @fragment
  fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let index = i32(pos.x) + (${screenHeight} - i32(pos.y)) * ${screenWidth};
    return vec4<f32>(pixels.data[index], 1);
  }
`;
};
