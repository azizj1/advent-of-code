import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './11.txt';

enum Seat {
  Floor = '.',
  Empty = 'L',
  Occupied = '#',
}

export interface Simulation {
  name: string;
  grid: string[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    grid: sim.content,
  }));
}

export class SeatingArea {
  readonly width: number;
  readonly height: number;

  constructor(protected readonly grid: string[]) {
    const widths = assert(grid, grid.length > 0).map((r: string) => r.length);
    assert(Math.min(...widths) === Math.max(...widths));
    this.width = widths[0];
    this.height = grid.length;
  }

  equals(other?: SeatingArea): boolean {
    if (other == null || !(other instanceof SeatingArea)) {
      return false;
    }
    if (other.height !== this.height || other.width !== this.width) {
      return false;
    }
    return other.seats.every((r, idx) => r === this.grid[idx]);
  }

  get seats() {
    return [...this.grid];
  }

  occupiedSeatsCount() {
    let count = 0;
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.isOccupied(j, i)) {
          count++;
        }
      }
    }
    return count;
  }

  simulate(): SeatingArea {
    const newGrid = [...this.grid];
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        const adjOccupiedCount = this.getAdjacentOccupiedSeatsCount(j, i);
        if (this.isEmpty(j, i) && adjOccupiedCount === 0) {
          newGrid[i] =
            newGrid[i].slice(0, j) + Seat.Occupied + newGrid[i].slice(j + 1);
        } else if (
          this.isOccupied(j, i) &&
          adjOccupiedCount >= this.maxNearbyOccupancy()
        ) {
          newGrid[i] =
            newGrid[i].slice(0, j) + Seat.Empty + newGrid[i].slice(j + 1);
        }
      }
    }
    assert(newGrid.length === this.height);
    newGrid.forEach((r, idx) =>
      assert(
        r.length === this.width,
        `new grid's width is different at idx ${idx}`
      )
    );
    return new SeatingArea(newGrid);
  }

  toString() {
    return this.grid.join('\n');
  }

  protected maxNearbyOccupancy(): number {
    return 4;
  }

  protected getAdjacentSeats(x: number, y: number) {
    assert(x < this.width);
    assert(y < this.height);
    return [
      this.grid[y][x - 1] ?? '',
      this.grid[y][x + 1] ?? '',
      this.grid[y - 1]?.[x - 1] ?? '',
      this.grid[y - 1]?.[x] ?? '',
      this.grid[y - 1]?.[x + 1] ?? '',
      this.grid[y + 1]?.[x - 1] ?? '',
      this.grid[y + 1]?.[x] ?? '',
      this.grid[y + 1]?.[x + 1] ?? '',
    ].filter((c) => c !== '');
  }

  protected isOccupied(x: number, y: number) {
    return (
      this.grid[assert(y, y < this.height)][assert(x, x < this.width)] ===
      Seat.Occupied
    );
  }

  protected isEmpty(x: number, y: number) {
    return (
      this.grid[
        assert(y, y < this.height, `y=${y} is >= height ${this.height}`)
      ][assert(x, x < this.width, `x=${x} is >= width ${this.width}`)] ===
      Seat.Empty
    );
  }

  private getAdjacentOccupiedSeatsCount(x: number, y: number) {
    return this.getAdjacentSeats(x, y).reduce(
      (count, curr) => count + (curr === Seat.Occupied ? 1 : 0),
      0
    );
  }
}

export function simulateUntilNoChange(ctor: typeof SeatingArea) {
  return ({ grid }: Simulation) => {
    let seatingArea = new ctor(grid);
    let nextSeatingArea = seatingArea;
    do {
      seatingArea = nextSeatingArea;
      nextSeatingArea = seatingArea.simulate();
    } while (!seatingArea.equals(nextSeatingArea));
    return seatingArea.occupiedSeatsCount();
  };
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(simulateUntilNoChange(SeatingArea), `day 11 - ${sim.name}`, sim);
}
