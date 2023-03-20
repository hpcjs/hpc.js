import { GPUVec2 } from './vec2';
import { GPUVec3 } from './vec3';

export class GPUVec4 {
  x: number;
  y: number;
  z: number;
  w: number;

  // required to stop duck typing
  type: 'vec4' = 'vec4';

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

  times(other: GPUVec4 | number) {
    if (typeof other === 'number') {
      return new GPUVec4(
        this.x * other,
        this.y * other,
        this.z * other,
        this.w * other
      );
    }

    return new GPUVec4(
      this.x * other.x,
      this.y * other.y,
      this.z * other.z,
      this.w * other.w
    );
  }

  div(other: GPUVec4 | number) {
    if (typeof other === 'number') {
      return new GPUVec4(
        this.x / other,
        this.y / other,
        this.z / other,
        this.w / other
      );
    }

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

  dist(other: GPUVec4) {
    return this.minus(other).length();
  }

  abs() {
    return new GPUVec4(
      Math.abs(this.x),
      Math.abs(this.y),
      Math.abs(this.z),
      Math.abs(this.w)
    );
  }

  acos() {
    return new GPUVec4(
      Math.acos(this.x),
      Math.acos(this.y),
      Math.acos(this.z),
      Math.acos(this.w)
    );
  }

  acosh() {
    return new GPUVec4(
      Math.acosh(this.x),
      Math.acosh(this.y),
      Math.acosh(this.z),
      Math.acosh(this.w)
    );
  }

  asin() {
    return new GPUVec4(
      Math.asin(this.x),
      Math.asin(this.y),
      Math.asin(this.z),
      Math.asin(this.w)
    );
  }

  asinh() {
    return new GPUVec4(
      Math.asinh(this.x),
      Math.asinh(this.y),
      Math.asinh(this.z),
      Math.asinh(this.w)
    );
  }

  atan() {
    return new GPUVec4(
      Math.atan(this.x),
      Math.atan(this.y),
      Math.atan(this.z),
      Math.atan(this.w)
    );
  }

  atanh() {
    return new GPUVec4(
      Math.atanh(this.x),
      Math.atanh(this.y),
      Math.atanh(this.z),
      Math.atanh(this.w)
    );
  }

  atan2(other: GPUVec4) {
    return new GPUVec4(
      Math.atan2(this.x, other.x),
      Math.atan2(this.y, other.y),
      Math.atan2(this.z, other.z),
      Math.atan2(this.w, other.w)
    );
  }

  ceil() {
    return new GPUVec4(
      Math.ceil(this.x),
      Math.ceil(this.y),
      Math.ceil(this.z),
      Math.ceil(this.w)
    );
  }

  cos() {
    return new GPUVec4(
      Math.cos(this.x),
      Math.cos(this.y),
      Math.cos(this.z),
      Math.cos(this.w)
    );
  }

  cosh() {
    return new GPUVec4(
      Math.cosh(this.x),
      Math.cosh(this.y),
      Math.cosh(this.z),
      Math.cosh(this.w)
    );
  }

  exp() {
    return new GPUVec4(
      Math.exp(this.x),
      Math.exp(this.y),
      Math.exp(this.z),
      Math.exp(this.w)
    );
  }

  floor() {
    return new GPUVec4(
      Math.floor(this.x),
      Math.floor(this.y),
      Math.floor(this.z),
      Math.floor(this.w)
    );
  }

  log() {
    return new GPUVec4(
      Math.log(this.x),
      Math.log(this.y),
      Math.log(this.z),
      Math.log(this.w)
    );
  }

  max(other: GPUVec4) {
    return new GPUVec4(
      Math.max(this.x, other.x),
      Math.max(this.y, other.y),
      Math.max(this.z, other.z),
      Math.max(this.w, other.w)
    );
  }

  min(other: GPUVec4) {
    return new GPUVec4(
      Math.min(this.x, other.x),
      Math.min(this.y, other.y),
      Math.min(this.z, other.z),
      Math.min(this.w, other.w)
    );
  }

  pow(other: GPUVec4) {
    return new GPUVec4(
      Math.pow(this.x, other.x),
      Math.pow(this.y, other.y),
      Math.pow(this.z, other.z),
      Math.pow(this.w, other.w)
    );
  }

  round() {
    return new GPUVec4(
      Math.round(this.x),
      Math.round(this.y),
      Math.round(this.z),
      Math.round(this.w)
    );
  }

  sign() {
    return new GPUVec4(
      Math.sign(this.x),
      Math.sign(this.y),
      Math.sign(this.z),
      Math.sign(this.w)
    );
  }

  sin() {
    return new GPUVec4(
      Math.sin(this.x),
      Math.sin(this.y),
      Math.sin(this.z),
      Math.sin(this.w)
    );
  }

  sinh() {
    return new GPUVec4(
      Math.sinh(this.x),
      Math.sinh(this.y),
      Math.sinh(this.z),
      Math.sinh(this.w)
    );
  }

  sqrt() {
    return new GPUVec4(
      Math.sqrt(this.x),
      Math.sqrt(this.y),
      Math.sqrt(this.z),
      Math.sqrt(this.w)
    );
  }

  tan() {
    return new GPUVec4(
      Math.tan(this.x),
      Math.tan(this.y),
      Math.tan(this.z),
      Math.tan(this.w)
    );
  }

  tanh() {
    return new GPUVec4(
      Math.tanh(this.x),
      Math.tanh(this.y),
      Math.tanh(this.z),
      Math.tanh(this.w)
    );
  }

  trunc() {
    return new GPUVec4(
      Math.trunc(this.x),
      Math.trunc(this.y),
      Math.trunc(this.z),
      Math.trunc(this.w)
    );
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

  get xw() {
    return new GPUVec2(this.x, this.w);
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

  get yw() {
    return new GPUVec2(this.y, this.w);
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

  get zw() {
    return new GPUVec2(this.z, this.w);
  }

  get wx() {
    return new GPUVec2(this.w, this.x);
  }

  get wy() {
    return new GPUVec2(this.w, this.y);
  }

  get wz() {
    return new GPUVec2(this.w, this.z);
  }

  get ww() {
    return new GPUVec2(this.w, this.w);
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

  get xxw() {
    return new GPUVec3(this.x, this.x, this.w);
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

  get xyw() {
    return new GPUVec3(this.x, this.y, this.w);
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

  get xzw() {
    return new GPUVec3(this.x, this.z, this.w);
  }

  get xwx() {
    return new GPUVec3(this.x, this.w, this.x);
  }

  get xwy() {
    return new GPUVec3(this.x, this.w, this.y);
  }

  get xwz() {
    return new GPUVec3(this.x, this.w, this.z);
  }

  get xww() {
    return new GPUVec3(this.x, this.w, this.w);
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

  get yxw() {
    return new GPUVec3(this.y, this.x, this.w);
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

  get yyw() {
    return new GPUVec3(this.y, this.y, this.w);
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

  get yzw() {
    return new GPUVec3(this.y, this.z, this.w);
  }

  get ywx() {
    return new GPUVec3(this.y, this.w, this.x);
  }

  get ywy() {
    return new GPUVec3(this.y, this.w, this.y);
  }

  get ywz() {
    return new GPUVec3(this.y, this.w, this.z);
  }

  get yww() {
    return new GPUVec3(this.y, this.w, this.w);
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

  get zxw() {
    return new GPUVec3(this.z, this.x, this.w);
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

  get zyw() {
    return new GPUVec3(this.z, this.y, this.w);
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

  get zzw() {
    return new GPUVec3(this.z, this.z, this.w);
  }

  get zwx() {
    return new GPUVec3(this.z, this.w, this.x);
  }

  get zwy() {
    return new GPUVec3(this.z, this.w, this.y);
  }

  get zwz() {
    return new GPUVec3(this.z, this.w, this.z);
  }

  get zww() {
    return new GPUVec3(this.z, this.w, this.w);
  }

  get wxx() {
    return new GPUVec3(this.w, this.x, this.x);
  }

  get wxy() {
    return new GPUVec3(this.w, this.x, this.y);
  }

  get wxz() {
    return new GPUVec3(this.w, this.x, this.z);
  }

  get wxw() {
    return new GPUVec3(this.w, this.x, this.w);
  }

  get wyx() {
    return new GPUVec3(this.w, this.y, this.x);
  }

  get wyy() {
    return new GPUVec3(this.w, this.y, this.y);
  }

  get wyz() {
    return new GPUVec3(this.w, this.y, this.z);
  }

  get wyw() {
    return new GPUVec3(this.w, this.y, this.w);
  }

  get wzx() {
    return new GPUVec3(this.w, this.z, this.x);
  }

  get wzy() {
    return new GPUVec3(this.w, this.z, this.y);
  }

  get wzz() {
    return new GPUVec3(this.w, this.z, this.z);
  }

  get wzw() {
    return new GPUVec3(this.w, this.z, this.w);
  }

  get wwx() {
    return new GPUVec3(this.w, this.w, this.x);
  }

  get wwy() {
    return new GPUVec3(this.w, this.w, this.y);
  }

  get wwz() {
    return new GPUVec3(this.w, this.w, this.z);
  }

  get www() {
    return new GPUVec3(this.w, this.w, this.w);
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

  get xxxw() {
    return new GPUVec4(this.x, this.x, this.x, this.w);
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

  get xxyw() {
    return new GPUVec4(this.x, this.x, this.y, this.w);
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

  get xxzw() {
    return new GPUVec4(this.x, this.x, this.z, this.w);
  }

  get xxwx() {
    return new GPUVec4(this.x, this.x, this.w, this.x);
  }

  get xxwy() {
    return new GPUVec4(this.x, this.x, this.w, this.y);
  }

  get xxwz() {
    return new GPUVec4(this.x, this.x, this.w, this.z);
  }

  get xxww() {
    return new GPUVec4(this.x, this.x, this.w, this.w);
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

  get xyxw() {
    return new GPUVec4(this.x, this.y, this.x, this.w);
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

  get xyyw() {
    return new GPUVec4(this.x, this.y, this.y, this.w);
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

  get xyzw() {
    return new GPUVec4(this.x, this.y, this.z, this.w);
  }

  get xywx() {
    return new GPUVec4(this.x, this.y, this.w, this.x);
  }

  get xywy() {
    return new GPUVec4(this.x, this.y, this.w, this.y);
  }

  get xywz() {
    return new GPUVec4(this.x, this.y, this.w, this.z);
  }

  get xyww() {
    return new GPUVec4(this.x, this.y, this.w, this.w);
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

  get xzxw() {
    return new GPUVec4(this.x, this.z, this.x, this.w);
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

  get xzyw() {
    return new GPUVec4(this.x, this.z, this.y, this.w);
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

  get xzzw() {
    return new GPUVec4(this.x, this.z, this.z, this.w);
  }

  get xzwx() {
    return new GPUVec4(this.x, this.z, this.w, this.x);
  }

  get xzwy() {
    return new GPUVec4(this.x, this.z, this.w, this.y);
  }

  get xzwz() {
    return new GPUVec4(this.x, this.z, this.w, this.z);
  }

  get xzww() {
    return new GPUVec4(this.x, this.z, this.w, this.w);
  }

  get xwxx() {
    return new GPUVec4(this.x, this.w, this.x, this.x);
  }

  get xwxy() {
    return new GPUVec4(this.x, this.w, this.x, this.y);
  }

  get xwxz() {
    return new GPUVec4(this.x, this.w, this.x, this.z);
  }

  get xwxw() {
    return new GPUVec4(this.x, this.w, this.x, this.w);
  }

  get xwyx() {
    return new GPUVec4(this.x, this.w, this.y, this.x);
  }

  get xwyy() {
    return new GPUVec4(this.x, this.w, this.y, this.y);
  }

  get xwyz() {
    return new GPUVec4(this.x, this.w, this.y, this.z);
  }

  get xwyw() {
    return new GPUVec4(this.x, this.w, this.y, this.w);
  }

  get xwzx() {
    return new GPUVec4(this.x, this.w, this.z, this.x);
  }

  get xwzy() {
    return new GPUVec4(this.x, this.w, this.z, this.y);
  }

  get xwzz() {
    return new GPUVec4(this.x, this.w, this.z, this.z);
  }

  get xwzw() {
    return new GPUVec4(this.x, this.w, this.z, this.w);
  }

  get xwwx() {
    return new GPUVec4(this.x, this.w, this.w, this.x);
  }

  get xwwy() {
    return new GPUVec4(this.x, this.w, this.w, this.y);
  }

  get xwwz() {
    return new GPUVec4(this.x, this.w, this.w, this.z);
  }

  get xwww() {
    return new GPUVec4(this.x, this.w, this.w, this.w);
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

  get yxxw() {
    return new GPUVec4(this.y, this.x, this.x, this.w);
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

  get yxyw() {
    return new GPUVec4(this.y, this.x, this.y, this.w);
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

  get yxzw() {
    return new GPUVec4(this.y, this.x, this.z, this.w);
  }

  get yxwx() {
    return new GPUVec4(this.y, this.x, this.w, this.x);
  }

  get yxwy() {
    return new GPUVec4(this.y, this.x, this.w, this.y);
  }

  get yxwz() {
    return new GPUVec4(this.y, this.x, this.w, this.z);
  }

  get yxww() {
    return new GPUVec4(this.y, this.x, this.w, this.w);
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

  get yyxw() {
    return new GPUVec4(this.y, this.y, this.x, this.w);
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

  get yyyw() {
    return new GPUVec4(this.y, this.y, this.y, this.w);
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

  get yyzw() {
    return new GPUVec4(this.y, this.y, this.z, this.w);
  }

  get yywx() {
    return new GPUVec4(this.y, this.y, this.w, this.x);
  }

  get yywy() {
    return new GPUVec4(this.y, this.y, this.w, this.y);
  }

  get yywz() {
    return new GPUVec4(this.y, this.y, this.w, this.z);
  }

  get yyww() {
    return new GPUVec4(this.y, this.y, this.w, this.w);
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

  get yzxw() {
    return new GPUVec4(this.y, this.z, this.x, this.w);
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

  get yzyw() {
    return new GPUVec4(this.y, this.z, this.y, this.w);
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

  get yzzw() {
    return new GPUVec4(this.y, this.z, this.z, this.w);
  }

  get yzwx() {
    return new GPUVec4(this.y, this.z, this.w, this.x);
  }

  get yzwy() {
    return new GPUVec4(this.y, this.z, this.w, this.y);
  }

  get yzwz() {
    return new GPUVec4(this.y, this.z, this.w, this.z);
  }

  get yzww() {
    return new GPUVec4(this.y, this.z, this.w, this.w);
  }

  get ywxx() {
    return new GPUVec4(this.y, this.w, this.x, this.x);
  }

  get ywxy() {
    return new GPUVec4(this.y, this.w, this.x, this.y);
  }

  get ywxz() {
    return new GPUVec4(this.y, this.w, this.x, this.z);
  }

  get ywxw() {
    return new GPUVec4(this.y, this.w, this.x, this.w);
  }

  get ywyx() {
    return new GPUVec4(this.y, this.w, this.y, this.x);
  }

  get ywyy() {
    return new GPUVec4(this.y, this.w, this.y, this.y);
  }

  get ywyz() {
    return new GPUVec4(this.y, this.w, this.y, this.z);
  }

  get ywyw() {
    return new GPUVec4(this.y, this.w, this.y, this.w);
  }

  get ywzx() {
    return new GPUVec4(this.y, this.w, this.z, this.x);
  }

  get ywzy() {
    return new GPUVec4(this.y, this.w, this.z, this.y);
  }

  get ywzz() {
    return new GPUVec4(this.y, this.w, this.z, this.z);
  }

  get ywzw() {
    return new GPUVec4(this.y, this.w, this.z, this.w);
  }

  get ywwx() {
    return new GPUVec4(this.y, this.w, this.w, this.x);
  }

  get ywwy() {
    return new GPUVec4(this.y, this.w, this.w, this.y);
  }

  get ywwz() {
    return new GPUVec4(this.y, this.w, this.w, this.z);
  }

  get ywww() {
    return new GPUVec4(this.y, this.w, this.w, this.w);
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

  get zxxw() {
    return new GPUVec4(this.z, this.x, this.x, this.w);
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

  get zxyw() {
    return new GPUVec4(this.z, this.x, this.y, this.w);
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

  get zxzw() {
    return new GPUVec4(this.z, this.x, this.z, this.w);
  }

  get zxwx() {
    return new GPUVec4(this.z, this.x, this.w, this.x);
  }

  get zxwy() {
    return new GPUVec4(this.z, this.x, this.w, this.y);
  }

  get zxwz() {
    return new GPUVec4(this.z, this.x, this.w, this.z);
  }

  get zxww() {
    return new GPUVec4(this.z, this.x, this.w, this.w);
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

  get zyxw() {
    return new GPUVec4(this.z, this.y, this.x, this.w);
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

  get zyyw() {
    return new GPUVec4(this.z, this.y, this.y, this.w);
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

  get zyzw() {
    return new GPUVec4(this.z, this.y, this.z, this.w);
  }

  get zywx() {
    return new GPUVec4(this.z, this.y, this.w, this.x);
  }

  get zywy() {
    return new GPUVec4(this.z, this.y, this.w, this.y);
  }

  get zywz() {
    return new GPUVec4(this.z, this.y, this.w, this.z);
  }

  get zyww() {
    return new GPUVec4(this.z, this.y, this.w, this.w);
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

  get zzxw() {
    return new GPUVec4(this.z, this.z, this.x, this.w);
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

  get zzyw() {
    return new GPUVec4(this.z, this.z, this.y, this.w);
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

  get zzzw() {
    return new GPUVec4(this.z, this.z, this.z, this.w);
  }

  get zzwx() {
    return new GPUVec4(this.z, this.z, this.w, this.x);
  }

  get zzwy() {
    return new GPUVec4(this.z, this.z, this.w, this.y);
  }

  get zzwz() {
    return new GPUVec4(this.z, this.z, this.w, this.z);
  }

  get zzww() {
    return new GPUVec4(this.z, this.z, this.w, this.w);
  }

  get zwxx() {
    return new GPUVec4(this.z, this.w, this.x, this.x);
  }

  get zwxy() {
    return new GPUVec4(this.z, this.w, this.x, this.y);
  }

  get zwxz() {
    return new GPUVec4(this.z, this.w, this.x, this.z);
  }

  get zwxw() {
    return new GPUVec4(this.z, this.w, this.x, this.w);
  }

  get zwyx() {
    return new GPUVec4(this.z, this.w, this.y, this.x);
  }

  get zwyy() {
    return new GPUVec4(this.z, this.w, this.y, this.y);
  }

  get zwyz() {
    return new GPUVec4(this.z, this.w, this.y, this.z);
  }

  get zwyw() {
    return new GPUVec4(this.z, this.w, this.y, this.w);
  }

  get zwzx() {
    return new GPUVec4(this.z, this.w, this.z, this.x);
  }

  get zwzy() {
    return new GPUVec4(this.z, this.w, this.z, this.y);
  }

  get zwzz() {
    return new GPUVec4(this.z, this.w, this.z, this.z);
  }

  get zwzw() {
    return new GPUVec4(this.z, this.w, this.z, this.w);
  }

  get zwwx() {
    return new GPUVec4(this.z, this.w, this.w, this.x);
  }

  get zwwy() {
    return new GPUVec4(this.z, this.w, this.w, this.y);
  }

  get zwwz() {
    return new GPUVec4(this.z, this.w, this.w, this.z);
  }

  get zwww() {
    return new GPUVec4(this.z, this.w, this.w, this.w);
  }

  get wxxx() {
    return new GPUVec4(this.w, this.x, this.x, this.x);
  }

  get wxxy() {
    return new GPUVec4(this.w, this.x, this.x, this.y);
  }

  get wxxz() {
    return new GPUVec4(this.w, this.x, this.x, this.z);
  }

  get wxxw() {
    return new GPUVec4(this.w, this.x, this.x, this.w);
  }

  get wxyx() {
    return new GPUVec4(this.w, this.x, this.y, this.x);
  }

  get wxyy() {
    return new GPUVec4(this.w, this.x, this.y, this.y);
  }

  get wxyz() {
    return new GPUVec4(this.w, this.x, this.y, this.z);
  }

  get wxyw() {
    return new GPUVec4(this.w, this.x, this.y, this.w);
  }

  get wxzx() {
    return new GPUVec4(this.w, this.x, this.z, this.x);
  }

  get wxzy() {
    return new GPUVec4(this.w, this.x, this.z, this.y);
  }

  get wxzz() {
    return new GPUVec4(this.w, this.x, this.z, this.z);
  }

  get wxzw() {
    return new GPUVec4(this.w, this.x, this.z, this.w);
  }

  get wxwx() {
    return new GPUVec4(this.w, this.x, this.w, this.x);
  }

  get wxwy() {
    return new GPUVec4(this.w, this.x, this.w, this.y);
  }

  get wxwz() {
    return new GPUVec4(this.w, this.x, this.w, this.z);
  }

  get wxww() {
    return new GPUVec4(this.w, this.x, this.w, this.w);
  }

  get wyxx() {
    return new GPUVec4(this.w, this.y, this.x, this.x);
  }

  get wyxy() {
    return new GPUVec4(this.w, this.y, this.x, this.y);
  }

  get wyxz() {
    return new GPUVec4(this.w, this.y, this.x, this.z);
  }

  get wyxw() {
    return new GPUVec4(this.w, this.y, this.x, this.w);
  }

  get wyyx() {
    return new GPUVec4(this.w, this.y, this.y, this.x);
  }

  get wyyy() {
    return new GPUVec4(this.w, this.y, this.y, this.y);
  }

  get wyyz() {
    return new GPUVec4(this.w, this.y, this.y, this.z);
  }

  get wyyw() {
    return new GPUVec4(this.w, this.y, this.y, this.w);
  }

  get wyzx() {
    return new GPUVec4(this.w, this.y, this.z, this.x);
  }

  get wyzy() {
    return new GPUVec4(this.w, this.y, this.z, this.y);
  }

  get wyzz() {
    return new GPUVec4(this.w, this.y, this.z, this.z);
  }

  get wyzw() {
    return new GPUVec4(this.w, this.y, this.z, this.w);
  }

  get wywx() {
    return new GPUVec4(this.w, this.y, this.w, this.x);
  }

  get wywy() {
    return new GPUVec4(this.w, this.y, this.w, this.y);
  }

  get wywz() {
    return new GPUVec4(this.w, this.y, this.w, this.z);
  }

  get wyww() {
    return new GPUVec4(this.w, this.y, this.w, this.w);
  }

  get wzxx() {
    return new GPUVec4(this.w, this.z, this.x, this.x);
  }

  get wzxy() {
    return new GPUVec4(this.w, this.z, this.x, this.y);
  }

  get wzxz() {
    return new GPUVec4(this.w, this.z, this.x, this.z);
  }

  get wzxw() {
    return new GPUVec4(this.w, this.z, this.x, this.w);
  }

  get wzyx() {
    return new GPUVec4(this.w, this.z, this.y, this.x);
  }

  get wzyy() {
    return new GPUVec4(this.w, this.z, this.y, this.y);
  }

  get wzyz() {
    return new GPUVec4(this.w, this.z, this.y, this.z);
  }

  get wzyw() {
    return new GPUVec4(this.w, this.z, this.y, this.w);
  }

  get wzzx() {
    return new GPUVec4(this.w, this.z, this.z, this.x);
  }

  get wzzy() {
    return new GPUVec4(this.w, this.z, this.z, this.y);
  }

  get wzzz() {
    return new GPUVec4(this.w, this.z, this.z, this.z);
  }

  get wzzw() {
    return new GPUVec4(this.w, this.z, this.z, this.w);
  }

  get wzwx() {
    return new GPUVec4(this.w, this.z, this.w, this.x);
  }

  get wzwy() {
    return new GPUVec4(this.w, this.z, this.w, this.y);
  }

  get wzwz() {
    return new GPUVec4(this.w, this.z, this.w, this.z);
  }

  get wzww() {
    return new GPUVec4(this.w, this.z, this.w, this.w);
  }

  get wwxx() {
    return new GPUVec4(this.w, this.w, this.x, this.x);
  }

  get wwxy() {
    return new GPUVec4(this.w, this.w, this.x, this.y);
  }

  get wwxz() {
    return new GPUVec4(this.w, this.w, this.x, this.z);
  }

  get wwxw() {
    return new GPUVec4(this.w, this.w, this.x, this.w);
  }

  get wwyx() {
    return new GPUVec4(this.w, this.w, this.y, this.x);
  }

  get wwyy() {
    return new GPUVec4(this.w, this.w, this.y, this.y);
  }

  get wwyz() {
    return new GPUVec4(this.w, this.w, this.y, this.z);
  }

  get wwyw() {
    return new GPUVec4(this.w, this.w, this.y, this.w);
  }

  get wwzx() {
    return new GPUVec4(this.w, this.w, this.z, this.x);
  }

  get wwzy() {
    return new GPUVec4(this.w, this.w, this.z, this.y);
  }

  get wwzz() {
    return new GPUVec4(this.w, this.w, this.z, this.z);
  }

  get wwzw() {
    return new GPUVec4(this.w, this.w, this.z, this.w);
  }

  get wwwx() {
    return new GPUVec4(this.w, this.w, this.w, this.x);
  }

  get wwwy() {
    return new GPUVec4(this.w, this.w, this.w, this.y);
  }

  get wwwz() {
    return new GPUVec4(this.w, this.w, this.w, this.z);
  }

  get wwww() {
    return new GPUVec4(this.w, this.w, this.w, this.w);
  }
}

export function vec4(x: number, y: number, z: number, w: number): GPUVec4;
export function vec4(val: number): GPUVec4;
export function vec4(xOrVal: number, y?: number, z?: number, w?: number) {
  if (y === undefined || z === undefined || w === undefined) {
    return new GPUVec4(xOrVal, xOrVal, xOrVal, xOrVal);
  }

  return new GPUVec4(xOrVal, y, z, w);
}
