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
  screenWidth: number
) => {
  return /* wgsl */ `
  struct PixelData {
    data: array<vec3<f32>>
  }

  @group(0) @binding(${pixelBufferIndex}) var<storage, read_write> pixels: PixelData;

  @fragment
  fn main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let index = i32(pos.x) + i32(pos.y) * ${screenWidth};
    return vec4<f32>(pixels.data[index], 1);
  }
`;
};
