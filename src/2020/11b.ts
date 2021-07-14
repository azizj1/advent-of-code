import { timer } from '~/util/Timer';
import { getSimulations, SeatingArea, simulateUntilNoChange } from './11';

interface Slope {
  mx: number;
  my: number;
}

class SeatingArea2 extends SeatingArea {
  private readonly slopes: Slope[] = [
    { mx: 1, my: 0 }, // right
    { mx: -1, my: 0 }, // left
    { mx: 0, my: 1 }, // down
    { mx: 0, my: -1 }, // up
    { mx: 1, my: 1 }, // right&down
    { mx: 1, my: -1 }, // right&up
    { mx: -1, my: 1 }, // left&down
    { mx: -1, my: -1 }, // left&up
  ];

  // The keys and values are number representation of (x,y).
  // They are determined via "y*width + x"
  private readonly adjSeatCache: Map<number, number[]>;

  constructor(grid: string[], adjSeatCache?: Map<number, number[]>) {
    super(grid);
    this.adjSeatCache = adjSeatCache ?? new Map();
  }

  /** @override */
  protected maxNearbyOccupancy() {
    return 5;
  }

  /** @override */
  protected getAdjacentSeats(x: number, y: number) {
    const key = this.toKey(x, y);
    if (this.adjSeatCache.has(key)) {
      return this.adjSeatCache
        .get(key)!
        .map((adjKey) => this.fromKey(adjKey))
        .map(({ x, y }) => this.grid[y][x]);
    }
    const seats: string[] = [];
    const seatLocs: number[] = [];
    for (const { mx, my } of this.slopes) {
      let newX = x + mx;
      let newY = y + my;
      while (this.isValidPoint(newX, newY)) {
        if (this.isOccupied(newX, newY) || this.isEmpty(newX, newY)) {
          seats.push(this.grid[newY][newX]);
          seatLocs.push(this.toKey(newX, newY));
          break;
        }
        newX += mx;
        newY += my;
      }
    }
    this.adjSeatCache.set(this.toKey(x, y), seatLocs);
    return seats;
  }

  /** @override */
  simulate() {
    const seatingArea = super.simulate();
    return new SeatingArea2(seatingArea.seats, this.adjSeatCache);
  }

  private isValidPoint(x: number, y: number) {
    return x < this.width && y < this.height && x >= 0 && y >= 0;
  }

  private toKey(x: number, y: number) {
    return y * this.width + x;
  }

  private fromKey(key: number): { x: number; y: number } {
    const y = Math.floor(key / this.width);
    const x = key % this.width;
    return { x, y };
  }
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(simulateUntilNoChange(SeatingArea2), `day 11b - ${sim.name}`, sim);
}
