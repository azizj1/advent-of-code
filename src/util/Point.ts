export class Point {
  constructor(readonly x: number, readonly y: number) {}

  add(right: number, down: number) {
    return new Point(this.x + right, this.y + down);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}
