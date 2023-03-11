export default class GPUVec4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  plus(other: GPUVec4) {
    return new GPUVec4(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
      this.w + other.w
    );
  }

  minus(other: GPUVec4) {
    return new GPUVec4(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
      this.w - other.w
    );
  }

  times(other: GPUVec4) {
    return new GPUVec4(
      this.x * other.x,
      this.y * other.y,
      this.z * other.z,
      this.w * other.w
    );
  }

  divide(other: GPUVec4) {
    return new GPUVec4(
      this.x / other.x,
      this.y / other.y,
      this.z / other.z,
      this.w / other.w
    );
  }

  dot(other: GPUVec4) {
    return (
      this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w
    );
  }

  length() {
    return Math.sqrt(this.dot(this));
  }

  normalized() {
    const length = this.length();
    return new GPUVec4(
      this.x / length,
      this.y / length,
      this.z / length,
      this.w / length
    );
  }
}
