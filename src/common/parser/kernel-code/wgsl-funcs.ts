export const getSetPixelSource = (width: number, height: number) => {
  return /* wgsl */ `fn hpc__setPixelv1(x: f32, y: f32, r: f32, g: f32, b: f32) {
  let index = (${height} - i32(y)) * ${width} + i32(x);
  hpc__pixels.data[index] = vec3<f32>(r / 255, g / 255, b / 255);
}

fn hpc__setPixelv2(pos: vec2<f32>, r: f32, g: f32, b: f32) {
  let index = (${height} - i32(pos.y)) * ${width} + i32(pos.x);
  hpc__pixels.data[index] = vec3<f32>(r / 255, g / 255, b / 255);
}

fn hpc__setPixelv3(x: f32, y: f32, color: vec3<f32>) {
  let index = (${height} - i32(y)) * ${width} + i32(x);
  hpc__pixels.data[index] = color / 255;
}

fn hpc__setPixelv4(pos: vec2<f32>, color: vec3<f32>) {
  let index = (${height} - i32(pos.y)) * ${width} + i32(pos.x);
  hpc__pixels.data[index] = color / 255;
}`;
};

export const getCplxSource = () => {
  return /* wgsl */ `fn hpc__cplxTimes(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

fn hpc__cplxDiv(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    a.x * b.x + a.y * b.y,
    a.y * b.x - a.x * b.y
  ) / dot(b, b);
}

fn hpc__cplxConj(a: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(a.x, -a.y);
}`;
};

export const getRandomSource = () => {
  return /* wgsl */ `var<private> hpc__randState: u32 = 0;
fn hpc__rand() -> f32 {
  hpc__randState = (hpc__randState * 1103515245 + 12345) % (1 << 24);
  return f32(hpc__randState) / f32(1 << 24);
}`;
};
