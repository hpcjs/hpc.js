export default class GPUArray {
  length: number;
  data: number[];

  constructor(data: number[]) {
    this.length = data.length;
    this.data = data;
  }
}
