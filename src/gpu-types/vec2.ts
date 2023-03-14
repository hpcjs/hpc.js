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

  times(other: GPUVec2 | number) {
    if (typeof other === 'number') {
      return new GPUVec2(this.x * other, this.y * other);
    }

    return new GPUVec2(this.x * other.x, this.y * other.y);
  }

  div(other: GPUVec2 | number) {
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
