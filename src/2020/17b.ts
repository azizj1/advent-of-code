import { assert } from '~/util/assert';
import { GenericSet } from '~/util/GenericSet';
import { InfiniteGrid } from '~/util/InfiniteGrid';
import { timer } from '~/util/Timer';
import { getPermutations, getRunsFromIniNewlineSep } from '~/util/util';
import input from './17.txt';

const ACTIVE = '#';

interface Simulation {
  name: string;
  pocket: PocketDimension;
}

class PocketDimension {
  private readonly grid = new InfiniteGrid<boolean>(4);
  // will have the 81 permutations of 4 dimensional vectors with -1, 0, or 1.
  private readonly neighborsOffset = getPermutations([-1, 0, 1], 4);

  constructor(initialStateOrGrid?: string[] | InfiniteGrid<boolean>) {
    if (Array.isArray(initialStateOrGrid)) {
      const initialState = initialStateOrGrid;
      for (let y = 0; y < initialState.length; y++) {
        for (let x = 0; x < initialState[y].length; x++) {
          this.grid.set([x, y, 0, 0], initialState[y][x] === ACTIVE);
        }
      }
    } else if (initialStateOrGrid != null) {
      this.grid = initialStateOrGrid as InfiniteGrid<boolean>;
    }
  }

  getActiveCubeCount(): number {
    let count = 0;
    for (const [, isActive] of this.grid.entries()) {
      if (isActive) {
        count++;
      }
    }
    return count;
  }

  toString() {
    let result = '';
    const [xB, yB, zB, wB] = this.grid.boundaries;
    for (let w = wB.min; w <= wB.max; w++) {
      for (let z = zB.min; z <= zB.max; z++) {
        result += `z=${z}, w=${w}, y=[${yB.min}, ${yB.max}], x=[${xB.min}, ${xB.max}]\n`;
        for (let y = yB.min; y <= yB.max; y++) {
          for (let x = xB.min; x <= xB.max; x++) {
            if (this.grid.get([x, y, z, w])) {
              result += '#';
            } else {
              result += '.';
            }
          }
          result += '\n';
        }
        result += '\n';
      }
      result += '\n';
    }
    return result;
  }

  // TODO(azizj): Don't scan every point possible within the boundaries. Only
  // scan the active points and their neighbors.
  getNextCycle(): PocketDimension {
    const newGrid = new InfiniteGrid<boolean>(4);
    for (const [vector, isActive] of this.grid.entries(true, 1)) {
      const neighbors = this.getActiveNeighborsCount(vector);
      if (isActive) {
        if (neighbors === 2 || neighbors === 3) {
          newGrid.set(vector, true);
        } else {
          newGrid.set(vector, false);
        }
      } else if (neighbors === 3) {
        newGrid.set(vector, true);
      }
    }
    return new PocketDimension(newGrid);
  }

  getNextCycle2(): PocketDimension {
    const newGrid = new InfiniteGrid<boolean>(4);
    const scanned = new GenericSet<number[]>((v) => v.join(','));
    // will only scan vectors that were actually set in the InfiniteGrid.
    for (const [vector, isActive] of this.grid.entries()) {
      const [x, y, z, w] = vector;
      if (isActive) {
        this.updatePointOnNewGrid(vector, newGrid);
        const neighbors = this.neighborsOffset.map(([xo, yo, zo, wo]) => [
          x + xo,
          y + yo,
          z + zo,
          w + wo,
        ]);
        // scan its neighbors too, even if they're inactive.
        for (const neighbor of neighbors) {
          if (!scanned.has(neighbor)) {
            this.updatePointOnNewGrid(neighbor, newGrid);
            scanned.add(neighbor);
          }
        }
      }
    }
    return new PocketDimension(newGrid);
  }

  private updatePointOnNewGrid(
    vector: number[],
    newGrid: InfiniteGrid<boolean>
  ) {
    const isActive = !!this.grid.get(vector);
    const activeNeighborCount = this.getActiveNeighborsCount(vector);
    if (isActive) {
      if (activeNeighborCount === 2 || activeNeighborCount === 3) {
        newGrid.set(vector, true);
      }
    } else if (activeNeighborCount === 3) {
      newGrid.set(vector, true);
    }
  }

  private getActiveNeighborsCount(vector: number[]): number {
    const [x, y, z, w] = assert(vector, vector.length === 4);
    let neighborsCount = this.neighborsOffset
      .map(([xo, yo, zo, wo]) => [x + xo, y + yo, z + zo, w + wo])
      .map((v) => this.grid.get(v))
      .filter((isActive) => isActive).length;

    // it counted itself a neighbor, so subtract that off.
    if (this.grid.get([x, y, z, w])) {
      neighborsCount--;
    }
    return neighborsCount;
  }
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    pocket: new PocketDimension(sim.content),
  }));
}

function execute({ pocket }: Simulation, cycles: number) {
  let current = pocket;
  for (let i = 0; i < cycles; i++) {
    current = current.getNextCycle2();
  }
  return current.getActiveCubeCount();
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(execute, `day 17b - ${sim.name}`, sim, 6);
}
