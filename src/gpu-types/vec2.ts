import { GPUVec3 } from './vec3';
import { GPUVec4 } from './vec4';

export class GPUVec2 {
  x: number;
  y: number;

  // required to stop duck typing
  type: 'vec2' = 'vec2';

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

  times(other: GPUVec2): GPUVec2;
  times(other: number): GPUVec2;
  times(other: GPUVec2 | number) {
    if (typeof other === 'number') {
      return new GPUVec2(this.x * other, this.y * other);
    }

    return new GPUVec2(this.x * other.x, this.y * other.y);
  }

  cplxTimes(other: GPUVec2) {
    return new GPUVec2(
      this.x * other.x - this.y * other.y,
      this.x * other.y + this.y * other.x
    );
  }

  div(other: GPUVec2): GPUVec2;
  div(other: number): GPUVec2;
  div(other: GPUVec2 | number) {
    if (typeof other === 'number') {
      return new GPUVec2(this.x / other, this.y / other);
    }

    return new GPUVec2(this.x / other.x, this.y / other.y);
  }

  cplxDiv(other: GPUVec2) {
    const denom = other.dot(other);
    return new GPUVec2(
      (this.x * other.x + this.y * other.y) / denom,
      (this.y * other.x - this.x * other.y) / denom
    );
  }

  cplxConj() {
    return new GPUVec2(this.x, -this.y);
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

  dist(other: GPUVec2) {
    return this.minus(other).length();
  }

  abs() {
    return new GPUVec2(Math.abs(this.x), Math.abs(this.y));
  }

  acos() {
    return new GPUVec2(Math.acos(this.x), Math.acos(this.y));
  }

  acosh() {
    return new GPUVec2(Math.acosh(this.x), Math.acosh(this.y));
  }

  asin() {
    return new GPUVec2(Math.asin(this.x), Math.asin(this.y));
  }

  asinh() {
    return new GPUVec2(Math.asinh(this.x), Math.asinh(this.y));
  }

  atan() {
    return new GPUVec2(Math.atan(this.x), Math.atan(this.y));
  }

  atanh() {
    return new GPUVec2(Math.atanh(this.x), Math.atanh(this.y));
  }

  atan2(other: GPUVec2) {
    return new GPUVec2(
      Math.atan2(this.x, other.x),
      Math.atan2(this.y, other.y)
    );
  }

  ceil() {
    return new GPUVec2(Math.ceil(this.x), Math.ceil(this.y));
  }

  cos() {
    return new GPUVec2(Math.cos(this.x), Math.cos(this.y));
  }

  cosh() {
    return new GPUVec2(Math.cosh(this.x), Math.cosh(this.y));
  }

  exp() {
    return new GPUVec2(Math.exp(this.x), Math.exp(this.y));
  }

  floor() {
    return new GPUVec2(Math.floor(this.x), Math.floor(this.y));
  }

  log() {
    return new GPUVec2(Math.log(this.x), Math.log(this.y));
  }

  log2() {
    return new GPUVec2(Math.log2(this.x), Math.log2(this.y));
  }

  max(other: GPUVec2) {
    return new GPUVec2(Math.max(this.x, other.x), Math.max(this.y, other.y));
  }

  min(other: GPUVec2) {
    return new GPUVec2(Math.min(this.x, other.x), Math.min(this.y, other.y));
  }

  pow(other: GPUVec2) {
    return new GPUVec2(Math.pow(this.x, other.x), Math.pow(this.y, other.y));
  }

  round() {
    return new GPUVec2(Math.round(this.x), Math.round(this.y));
  }

  sign() {
    return new GPUVec2(Math.sign(this.x), Math.sign(this.y));
  }

  sin() {
    return new GPUVec2(Math.sin(this.x), Math.sin(this.y));
  }

  sinh() {
    return new GPUVec2(Math.sinh(this.x), Math.sinh(this.y));
  }

  sqrt() {
    return new GPUVec2(Math.sqrt(this.x), Math.sqrt(this.y));
  }

  tan() {
    return new GPUVec2(Math.tan(this.x), Math.tan(this.y));
  }

  tanh() {
    return new GPUVec2(Math.tanh(this.x), Math.tanh(this.y));
  }

  trunc() {
    return new GPUVec2(Math.trunc(this.x), Math.trunc(this.y));
  }

  get xx() {
    return new GPUVec2(this.x, this.x);
  }

  get xy() {
    return new GPUVec2(this.x, this.y);
  }

  get yx() {
    return new GPUVec2(this.y, this.x);
  }

  get yy() {
    return new GPUVec2(this.y, this.y);
  }

  get xxx() {
    return new GPUVec3(this.x, this.x, this.x);
  }

  get xxy() {
    return new GPUVec3(this.x, this.x, this.y);
  }

  get xyx() {
    return new GPUVec3(this.x, this.y, this.x);
  }

  get xyy() {
    return new GPUVec3(this.x, this.y, this.y);
  }

  get yxx() {
    return new GPUVec3(this.y, this.x, this.x);
  }

  get yxy() {
    return new GPUVec3(this.y, this.x, this.y);
  }

  get yyx() {
    return new GPUVec3(this.y, this.y, this.x);
  }

  get yyy() {
    return new GPUVec3(this.y, this.y, this.y);
  }

  get xxxx() {
    return new GPUVec4(this.x, this.x, this.x, this.x);
  }

  get xxxy() {
    return new GPUVec4(this.x, this.x, this.x, this.y);
  }

  get xxyx() {
    return new GPUVec4(this.x, this.x, this.y, this.x);
  }

  get xxyy() {
    return new GPUVec4(this.x, this.x, this.y, this.y);
  }

  get xyxx() {
    return new GPUVec4(this.x, this.y, this.x, this.x);
  }

  get xyxy() {
    return new GPUVec4(this.x, this.y, this.x, this.y);
  }

  get xyyx() {
    return new GPUVec4(this.x, this.y, this.y, this.x);
  }

  get xyyy() {
    return new GPUVec4(this.x, this.y, this.y, this.y);
  }

  get yxxx() {
    return new GPUVec4(this.y, this.x, this.x, this.x);
  }

  get yxxy() {
    return new GPUVec4(this.y, this.x, this.x, this.y);
  }

  get yxyx() {
    return new GPUVec4(this.y, this.x, this.y, this.x);
  }

  get yxyy() {
    return new GPUVec4(this.y, this.x, this.y, this.y);
  }

  get yyxx() {
    return new GPUVec4(this.y, this.y, this.x, this.x);
  }

  get yyxy() {
    return new GPUVec4(this.y, this.y, this.x, this.y);
  }

  get yyyx() {
    return new GPUVec4(this.y, this.y, this.y, this.x);
  }

  get yyyy() {
    return new GPUVec4(this.y, this.y, this.y, this.y);
  }
}

export function vec2(x: number, y: number): GPUVec2;
export function vec2(val: number): GPUVec2;
export function vec2(xOrVal: number, y?: number) {
  if (y === undefined) {
    return new GPUVec2(xOrVal, xOrVal);
  }

  return new GPUVec2(xOrVal, y);
}
