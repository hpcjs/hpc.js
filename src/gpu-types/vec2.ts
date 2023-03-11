export default class GPUVec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  plus(other: GPUVec2) {
    return new GPUVec2(this.x + other.x, this.y + other.y);
  }

  minus(other: GPUVec2) {
    return new GPUVec2(this.x - other.x, this.y - other.y);
  }

  times(other: GPUVec2 | number) {
    if (typeof other === 'number') {
      return new GPUVec2(this.x * other, this.y * other);
    }

    return new GPUVec2(this.x * other.x, this.y * other.y);
  }

  divide(other: GPUVec2 | number) {
    if (typeof other === 'number') {
      return new GPUVec2(this.x / other, this.y / other);
    }

    return new GPUVec2(this.x / other.x, this.y / other.y);
  }

  dot(other: GPUVec2) {
    return this.x * other.x + this.y * other.y;
  }

  length() {
    return Math.sqrt(this.dot(this));
  }

  normalized() {
    const length = this.length();
    return new GPUVec2(this.x / length, this.y / length);
  }
}

export function vec2(x: number, y: number) {
  return new GPUVec2(x, y);
}
