import { assert } from '~/util/assert';
import { BiMap } from '~/util/BiMap';
import { mod } from '~/util/math';
import { last } from '~/util/util';

export enum Side {
  Top = 0,
  Right = 1,
  Down = 2,
  Left = 3,
}

interface AlignTileResponse {
  aligned: boolean;
  this?: {
    id: number;
    border: string;
    locationBefore: Side;
    locationAfter: Side;
    reflected: 'no' | 'x' | 'y';
  };
  other?: {
    id: number;
    border: string;
    location: Side;
  };
}

export function reverse(str: string): string {
  return [...str].reverse().join('');
}

export class Tile {
  readonly size: number;

  private grid1D: string[] = [];
  private borders_ = new Map<string, Side>();
  // if the borders need to be updated first.
  private dirty = false;
  // [xc, yc, c]. When given a coordinate like (x, y), we can get the value at
  // that component by doing x*xc + y*yc + c.
  // Initally, the equation is idx = x + w*y, where w = size of tile.
  // Allowing us to change this makes rotation a lot simipler.
  // A rotation of 90 degrees clockwise is just making this vector from [xc, yc,
  // c] to [-yc, xc, idx(0, w-1)].
  private cordsToIdxVector: [number, number, number];

  constructor(readonly id: number, grid: string[][]) {
    this.size = grid.length;
    grid
      .map((r) => r.length)
      .forEach((l) => assert(l === this.size, 'Tile must be a square.'));

    this.cordsToIdxVector = [1, this.size, 0];
    // Converts something like
    //    a b c
    //    d e f
    //    g h i
    // to this:
    //    a, b, c, d, e, f, g, h, i
    this.grid1D = grid.flatMap((r) => [...r]);
    this.borders_ = new Map();
    this.borders_.set(grid[0].join(''), Side.Top);
    this.borders_.set(grid.map((g) => last(g)).join(''), Side.Right);
    // going clockwise, so the bottom border goes from right to left. Have to do
    // [...last(..] because reverse() is a mutable function.
    this.borders_.set([...last(grid)].reverse().join(''), Side.Down);
    // CW, so going from bottom to top for left side.
    this.borders_.set(
      grid
        .map((r) => r[0])
        .reverse()
        .join(''),
      Side.Left
    );
  }

  toString(withHeader = false) {
    let output = withHeader ? `Tile ${this.id}\n` : '';

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        output += this.get(j, i);
      }
      output += '\n';
    }
    return output;
  }

  to2DArray(): string[][] {
    const output: string[][] = [];
    for (let i = 0; i < this.size; i++) {
      const row: string[] = [];
      for (let j = 0; j < this.size; j++) {
        row.push(this.get(j, i));
      }
      output.push(row);
    }
    return output;
  }

  get borders(): Set<string> {
    if (this.dirty) {
      this.updateBorders();
    }
    return new Set(this.borders_.keys());
  }

  get bordersLocation(): BiMap<string, Side> {
    if (this.dirty) {
      this.updateBorders();
    }
    return new BiMap(this.borders_);
  }

  get(x: number, y: number): string {
    return this.grid1D[this.toIndex(x, y)];
  }

  getOrDefault(x: number, y: number): string | undefined {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.get(x, y);
    }
    return undefined;
  }

  private toIndex(x: number, y: number) {
    assert(x, x >= 0 && x < this.size);
    assert(y, y >= 0 && y < this.size);
    const [xc, yc, c] = this.cordsToIdxVector;
    return x * xc + y * yc + c;
  }

  /**
   * Will align this tile to the other tile if possible. What that means is that
   * if the other tile's right side is identical to this tile's top side, then
   * this function will rotate this tile so that this tile's top side becomes
   * its LEFT side, so that other tile and this tile can be right next to each
   * other.
   * It also may be the case that the tiles match, but this tile may be flipped,
   * so the sides match but just in the opposite direction. In this case, we'll
   * need to flip over the x or y axis.
   */
  alignToTile(other: Tile): AlignTileResponse {
    const { thisBorder, otherBorder, flipped, found } =
      this.getMatchingBorder(other);
    if (!found) {
      return { aligned: false };
    }
    let reflected: 'no' | 'x' | 'y' = 'no';
    const thisBorderLocation = this.borders_.get(thisBorder!)!;
    // If top, we want this border to go to bottom. If left, right. Vice versa.
    const newBorderLocation = mod(other.borders_.get(otherBorder!)! + 2, 4);
    let numOf90DegRotations = mod(newBorderLocation - thisBorderLocation, 4);

    while (numOf90DegRotations-- > 0) {
      this.rotate90DegreesCW();
    }
    // Imagine "this"'s bottom two lines are:
    // .....
    // ###..
    // And "other"'s top 2 lines are:
    // ###..
    // .....
    // It looks like they don't have to be touched at all. Top/bottom are
    // aligned, and they look identical. However, since the borders are
    // retrieved clockwise, in our borders_ Map, we'll have other's top border
    // equal to '###..', and this's bottom border eqaul to '..###'. So if they
    // have to be flipped, it means they're in the right orientation, and you
    // don't have to do anything. If they aren't flipped, then you need to do
    // some reflection.
    if (!flipped) {
      if (newBorderLocation === Side.Top || newBorderLocation === Side.Down) {
        reflected = 'y';
        this.reflectOverYAxis();
      } else {
        reflected = 'x';
        this.reflectOverXAxis();
      }
    }
    return {
      aligned: true,
      this: {
        id: this.id,
        border: thisBorder!,
        locationBefore: thisBorderLocation,
        locationAfter: newBorderLocation,
        reflected,
      },
      other: {
        id: other.id,
        border: otherBorder!,
        location: mod(newBorderLocation + 2, 4),
      },
    };
  }

  private updateBorders() {
    this.borders_ = new Map();
    let topBorder = '';
    let rightBorder = '';
    let bottomBorder = '';
    let leftBorder = '';

    for (let i = 0; i < this.size; i++) {
      topBorder += this.get(i, 0);
      rightBorder += this.get(this.size - 1, i);
      bottomBorder += this.get(this.size - 1 - i, this.size - 1);
      leftBorder += this.get(0, this.size - 1 - i);
    }

    this.borders_.set(topBorder, Side.Top);
    this.borders_.set(rightBorder, Side.Right);
    this.borders_.set(bottomBorder, Side.Down);
    this.borders_.set(leftBorder, Side.Left);
    this.dirty = false;
  }

  /**
   * Rotate the vector that transforms (x, y) to an index in grid by 90 degrees
   * clockwise.
   */
  rotate90DegreesCW() {
    const [xc, yc] = this.cordsToIdxVector;
    const newConstant = this.toIndex(0, this.size - 1);
    this.cordsToIdxVector = [-yc, xc, newConstant];
    this.dirty = true;
  }

  reflectOverYAxis() {
    const [xc, yc] = this.cordsToIdxVector;
    const newConstant = this.toIndex(this.size - 1, 0);
    this.cordsToIdxVector = [-xc, yc, newConstant];
    this.dirty = true;
  }

  reflectOverXAxis() {
    const [xc, yc] = this.cordsToIdxVector;
    const newConstant = this.toIndex(0, this.size - 1);
    this.cordsToIdxVector = [xc, -yc, newConstant];
    this.dirty = true;
  }

  // eslint-disable: @typescript-eslint/no-inferrable-types
  private getMatchingBorder(other: Tile): {
    thisBorder?: string;
    otherBorder?: string;
    flipped?: boolean;
    found: boolean;
  } {
    let thisBorder = '';
    let otherBorder = '';
    let flipped = false;
    for (const border of this.borders_.keys()) {
      if (other.borders_.has(border)) {
        thisBorder = border;
        otherBorder = border;
      }
    }
    if (thisBorder === '') {
      for (const border of this.borders_.keys()) {
        const reversed = reverse(border);
        if (other.borders_.has(reversed)) {
          thisBorder = border;
          otherBorder = reversed;
          flipped = true;
        }
      }
    }
    if (thisBorder === '') {
      return { found: false };
    }
    return { thisBorder, otherBorder, flipped, found: true };
  }
}
