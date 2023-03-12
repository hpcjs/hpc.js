import { GPUVec2 } from './vec2';
import { GPUVec4 } from './vec4';

export class GPUVec3 {
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

  div(other: GPUVec3 | number) {
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

  get xx() {
    return new GPUVec2(this.x, this.x);
  }

  get xy() {
    return new GPUVec2(this.x, this.y);
  }

  get xz() {
    return new GPUVec2(this.x, this.z);
  }

  get yx() {
    return new GPUVec2(this.y, this.x);
  }

  get yy() {
    return new GPUVec2(this.y, this.y);
  }

  get yz() {
    return new GPUVec2(this.y, this.z);
  }

  get zx() {
    return new GPUVec2(this.z, this.x);
  }

  get zy() {
    return new GPUVec2(this.z, this.y);
  }

  get zz() {
    return new GPUVec2(this.z, this.z);
  }

  get xxx() {
    return new GPUVec3(this.x, this.x, this.x);
  }

  get xxy() {
    return new GPUVec3(this.x, this.x, this.y);
  }

  get xxz() {
    return new GPUVec3(this.x, this.x, this.z);
  }

  get xyx() {
    return new GPUVec3(this.x, this.y, this.x);
  }

  get xyy() {
    return new GPUVec3(this.x, this.y, this.y);
  }

  get xyz() {
    return new GPUVec3(this.x, this.y, this.z);
  }

  get xzx() {
    return new GPUVec3(this.x, this.z, this.x);
  }

  get xzy() {
    return new GPUVec3(this.x, this.z, this.y);
  }

  get xzz() {
    return new GPUVec3(this.x, this.z, this.z);
  }

  get yxx() {
    return new GPUVec3(this.y, this.x, this.x);
  }

  get yxy() {
    return new GPUVec3(this.y, this.x, this.y);
  }

  get yxz() {
    return new GPUVec3(this.y, this.x, this.z);
  }

  get yyx() {
    return new GPUVec3(this.y, this.y, this.x);
  }

  get yyy() {
    return new GPUVec3(this.y, this.y, this.y);
  }

  get yyz() {
    return new GPUVec3(this.y, this.y, this.z);
  }

  get yzx() {
    return new GPUVec3(this.y, this.z, this.x);
  }

  get yzy() {
    return new GPUVec3(this.y, this.z, this.y);
  }

  get yzz() {
    return new GPUVec3(this.y, this.z, this.z);
  }

  get zxx() {
    return new GPUVec3(this.z, this.x, this.x);
  }

  get zxy() {
    return new GPUVec3(this.z, this.x, this.y);
  }

  get zxz() {
    return new GPUVec3(this.z, this.x, this.z);
  }

  get zyx() {
    return new GPUVec3(this.z, this.y, this.x);
  }

  get zyy() {
    return new GPUVec3(this.z, this.y, this.y);
  }

  get zyz() {
    return new GPUVec3(this.z, this.y, this.z);
  }

  get zzx() {
    return new GPUVec3(this.z, this.z, this.x);
  }

  get zzy() {
    return new GPUVec3(this.z, this.z, this.y);
  }

  get zzz() {
    return new GPUVec3(this.z, this.z, this.z);
  }

  get xxxx() {
    return new GPUVec4(this.x, this.x, this.x, this.x);
  }

  get xxxy() {
    return new GPUVec4(this.x, this.x, this.x, this.y);
  }

  get xxxz() {
    return new GPUVec4(this.x, this.x, this.x, this.z);
  }

  get xxyx() {
    return new GPUVec4(this.x, this.x, this.y, this.x);
  }

  get xxyy() {
    return new GPUVec4(this.x, this.x, this.y, this.y);
  }

  get xxyz() {
    return new GPUVec4(this.x, this.x, this.y, this.z);
  }

  get xxzx() {
    return new GPUVec4(this.x, this.x, this.z, this.x);
  }

  get xxzy() {
    return new GPUVec4(this.x, this.x, this.z, this.y);
  }

  get xxzz() {
    return new GPUVec4(this.x, this.x, this.z, this.z);
  }

  get xyxx() {
    return new GPUVec4(this.x, this.y, this.x, this.x);
  }

  get xyxy() {
    return new GPUVec4(this.x, this.y, this.x, this.y);
  }

  get xyxz() {
    return new GPUVec4(this.x, this.y, this.x, this.z);
  }

  get xyyx() {
    return new GPUVec4(this.x, this.y, this.y, this.x);
  }

  get xyyy() {
    return new GPUVec4(this.x, this.y, this.y, this.y);
  }

  get xyyz() {
    return new GPUVec4(this.x, this.y, this.y, this.z);
  }

  get xyzx() {
    return new GPUVec4(this.x, this.y, this.z, this.x);
  }

  get xyzy() {
    return new GPUVec4(this.x, this.y, this.z, this.y);
  }

  get xyzz() {
    return new GPUVec4(this.x, this.y, this.z, this.z);
  }

  get xzxx() {
    return new GPUVec4(this.x, this.z, this.x, this.x);
  }

  get xzxy() {
    return new GPUVec4(this.x, this.z, this.x, this.y);
  }

  get xzxz() {
    return new GPUVec4(this.x, this.z, this.x, this.z);
  }

  get xzyx() {
    return new GPUVec4(this.x, this.z, this.y, this.x);
  }

  get xzyy() {
    return new GPUVec4(this.x, this.z, this.y, this.y);
  }

  get xzyz() {
    return new GPUVec4(this.x, this.z, this.y, this.z);
  }

  get xzzx() {
    return new GPUVec4(this.x, this.z, this.z, this.x);
  }

  get xzzy() {
    return new GPUVec4(this.x, this.z, this.z, this.y);
  }

  get xzzz() {
    return new GPUVec4(this.x, this.z, this.z, this.z);
  }

  get yxxx() {
    return new GPUVec4(this.y, this.x, this.x, this.x);
  }

  get yxxy() {
    return new GPUVec4(this.y, this.x, this.x, this.y);
  }

  get yxxz() {
    return new GPUVec4(this.y, this.x, this.x, this.z);
  }

  get yxyx() {
    return new GPUVec4(this.y, this.x, this.y, this.x);
  }

  get yxyy() {
    return new GPUVec4(this.y, this.x, this.y, this.y);
  }

  get yxyz() {
    return new GPUVec4(this.y, this.x, this.y, this.z);
  }

  get yxzx() {
    return new GPUVec4(this.y, this.x, this.z, this.x);
  }

  get yxzy() {
    return new GPUVec4(this.y, this.x, this.z, this.y);
  }

  get yxzz() {
    return new GPUVec4(this.y, this.x, this.z, this.z);
  }

  get yyxx() {
    return new GPUVec4(this.y, this.y, this.x, this.x);
  }

  get yyxy() {
    return new GPUVec4(this.y, this.y, this.x, this.y);
  }

  get yyxz() {
    return new GPUVec4(this.y, this.y, this.x, this.z);
  }

  get yyyx() {
    return new GPUVec4(this.y, this.y, this.y, this.x);
  }

  get yyyy() {
    return new GPUVec4(this.y, this.y, this.y, this.y);
  }

  get yyyz() {
    return new GPUVec4(this.y, this.y, this.y, this.z);
  }

  get yyzx() {
    return new GPUVec4(this.y, this.y, this.z, this.x);
  }

  get yyzy() {
    return new GPUVec4(this.y, this.y, this.z, this.y);
  }

  get yyzz() {
    return new GPUVec4(this.y, this.y, this.z, this.z);
  }

  get yzxx() {
    return new GPUVec4(this.y, this.z, this.x, this.x);
  }

  get yzxy() {
    return new GPUVec4(this.y, this.z, this.x, this.y);
  }

  get yzxz() {
    return new GPUVec4(this.y, this.z, this.x, this.z);
  }

  get yzyx() {
    return new GPUVec4(this.y, this.z, this.y, this.x);
  }

  get yzyy() {
    return new GPUVec4(this.y, this.z, this.y, this.y);
  }

  get yzyz() {
    return new GPUVec4(this.y, this.z, this.y, this.z);
  }

  get yzzx() {
    return new GPUVec4(this.y, this.z, this.z, this.x);
  }

  get yzzy() {
    return new GPUVec4(this.y, this.z, this.z, this.y);
  }

  get yzzz() {
    return new GPUVec4(this.y, this.z, this.z, this.z);
  }

  get zxxx() {
    return new GPUVec4(this.z, this.x, this.x, this.x);
  }

  get zxxy() {
    return new GPUVec4(this.z, this.x, this.x, this.y);
  }

  get zxxz() {
    return new GPUVec4(this.z, this.x, this.x, this.z);
  }

  get zxyx() {
    return new GPUVec4(this.z, this.x, this.y, this.x);
  }

  get zxyy() {
    return new GPUVec4(this.z, this.x, this.y, this.y);
  }

  get zxyz() {
    return new GPUVec4(this.z, this.x, this.y, this.z);
  }

  get zxzx() {
    return new GPUVec4(this.z, this.x, this.z, this.x);
  }

  get zxzy() {
    return new GPUVec4(this.z, this.x, this.z, this.y);
  }

  get zxzz() {
    return new GPUVec4(this.z, this.x, this.z, this.z);
  }

  get zyxx() {
    return new GPUVec4(this.z, this.y, this.x, this.x);
  }

  get zyxy() {
    return new GPUVec4(this.z, this.y, this.x, this.y);
  }

  get zyxz() {
    return new GPUVec4(this.z, this.y, this.x, this.z);
  }

  get zyyx() {
    return new GPUVec4(this.z, this.y, this.y, this.x);
  }

  get zyyy() {
    return new GPUVec4(this.z, this.y, this.y, this.y);
  }

  get zyyz() {
    return new GPUVec4(this.z, this.y, this.y, this.z);
  }

  get zyzx() {
    return new GPUVec4(this.z, this.y, this.z, this.x);
  }

  get zyzy() {
    return new GPUVec4(this.z, this.y, this.z, this.y);
  }

  get zyzz() {
    return new GPUVec4(this.z, this.y, this.z, this.z);
  }

  get zzxx() {
    return new GPUVec4(this.z, this.z, this.x, this.x);
  }

  get zzxy() {
    return new GPUVec4(this.z, this.z, this.x, this.y);
  }

  get zzxz() {
    return new GPUVec4(this.z, this.z, this.x, this.z);
  }

  get zzyx() {
    return new GPUVec4(this.z, this.z, this.y, this.x);
  }

  get zzyy() {
    return new GPUVec4(this.z, this.z, this.y, this.y);
  }

  get zzyz() {
    return new GPUVec4(this.z, this.z, this.y, this.z);
  }

  get zzzx() {
    return new GPUVec4(this.z, this.z, this.z, this.x);
  }

  get zzzy() {
    return new GPUVec4(this.z, this.z, this.z, this.y);
  }

  get zzzz() {
    return new GPUVec4(this.z, this.z, this.z, this.z);
  }
}

export function vec3(x: number, y: number, z: number) {
  return new GPUVec3(x, y, z);
}
