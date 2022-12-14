export class Coordinate {
  constructor(public x = 0, public y = 0) {}

  clone() {
    return new Coordinate(this.x, this.y);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}
