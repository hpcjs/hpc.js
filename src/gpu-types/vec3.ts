export default class GPUVec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  plus(other: GPUVec3) {
    return new GPUVec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  minus(other: GPUVec3) {
    return new GPUVec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  times(other: GPUVec3 | number) {
    if (typeof other === 'number') {
      return new GPUVec3(this.x * other, this.y * other, this.z * other);
    }

    return new GPUVec3(this.x * other.x, this.y * other.y, this.z * other.z);
  }

  divide(other: GPUVec3 | number) {
    if (typeof other === 'number') {
      return new GPUVec3(this.x / other, this.y / other, this.z / other);
    }

    return new GPUVec3(this.x / other.x, this.y / other.y, this.z / other.z);
  }

  dot(other: GPUVec3) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: GPUVec3) {
    return new GPUVec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  length() {
    return Math.sqrt(this.dot(this));
  }

  normalized() {
    const length = this.length();
    return new GPUVec3(this.x / length, this.y / length, this.z / length);
  }
}

export function vec3(x: number, y: number, z: number) {
  return new GPUVec3(x, y, z);
}
