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
  private static readonly SIZE = 10;
  private grid1D: string[] = [];
  private borders_ = new Map<string, Side>();
  // if the borders need to be updated first.
  private dirty = false;
  // [xc, yc, c]. When given a coordinate like (x, y), we can get the value at
  // that component by doing x*xc + y*yc + c.
  // Initally, the equation is idx = x + w*y, where w = 10.
  // Allowing us to change this makes rotation a lot simipler.
  // A rotation of 90 degrees clockwise is just making this vector from [xc, yc,
  // c] to [-yc, xc, idx(0, w-1)].
  private cordsToIdxVector = [1, Tile.SIZE, 0];

  constructor(readonly id: number, grid: string[]) {
    assert(grid.length === Tile.SIZE);
    grid.map((r) => r.length).forEach((l) => assert(l === Tile.SIZE));

    this.grid1D = grid.flatMap((r) => [...r]);
    this.borders_ = new Map();
    this.borders_.set(grid[0], Side.Top);
    this.borders_.set(grid.map((g) => last(g)).join(''), Side.Right);
    this.borders_.set(reverse(last(grid)), Side.Down);
    this.borders_.set(
      grid
        .map((g) => g[0])
        .reverse()
        .join(''),
      Side.Left
    );
  }

  toString(withHeader = false) {
    let output = withHeader ? `Tile ${this.id}\n` : '';

    for (let i = 0; i < Tile.SIZE; i++) {
      for (let j = 0; j < Tile.SIZE; j++) {
        output += this.get(j, i);
      }
      output += '\n';
    }
    return output;
  }

  get borders() {
    if (this.dirty) {
      this.updateBorders();
    }
    return new Set(this.borders_.keys());
  }

  get bordersLocation() {
    if (this.dirty) {
      this.updateBorders();
    }
    return new BiMap(this.borders_);
  }

  get(x: number, y: number) {
    return this.grid1D[this.toIndex(x, y)];
  }

  private toIndex(x: number, y: number) {
    assert(x, x >= 0 && x < Tile.SIZE);
    assert(y, y >= 0 && y < Tile.SIZE);
    const [xc, yc, c] = this.cordsToIdxVector;
    return x * xc + y * yc + c;
  }

  /**
   * Will align this Tile to the other tile if possible. What that means is that
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
    // Imagine "other"'s top 2 lines are:
    // ###..
    // .....
    // And "this"'s bottom two lines are:
    // .....
    // ###..
    // It looks like they don't have to be touched at all. Top/bottom are
    // aligned, adn they look identical. However, since the borders are
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
    this.updateBorders();
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

    for (let i = 0; i < Tile.SIZE; i++) {
      topBorder += this.get(i, 0);
      rightBorder += this.get(Tile.SIZE - 1, i);
      bottomBorder += this.get(Tile.SIZE - 1 - i, Tile.SIZE - 1);
      leftBorder += this.get(0, Tile.SIZE - 1 - i);
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
    const newConstant = this.toIndex(0, Tile.SIZE - 1);
    this.cordsToIdxVector = [-yc, xc, newConstant];
    this.dirty = true;
  }

  private reflectOverYAxis() {
    const [xc, yc] = this.cordsToIdxVector;
    const newConstant = this.toIndex(Tile.SIZE - 1, 0);
    this.cordsToIdxVector = [-xc, yc, newConstant];
    this.dirty = true;
  }

  private reflectOverXAxis() {
    const [xc, yc] = this.cordsToIdxVector;
    const newConstant = this.toIndex(0, Tile.SIZE - 1);
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
