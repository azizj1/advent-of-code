import { ArrayDeque } from '~/util/ArrayDeque';
import { Deque } from '~/util/Deque';
import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './17.txt';

interface Simulation {
  name: string;
  pocket: PocketDimension;
}

type Grid = Deque<Deque<Deque<boolean>>>;

const ACTIVE = '#';

class PocketDimension {
  private readonly grid: Grid;

  constructor(initialStateOrGrid?: string[] | Grid) {
    this.grid = new ArrayDeque();
    if (Array.isArray(initialStateOrGrid)) {
      this.grid = this.parseInitialState(initialStateOrGrid);
    } else if (this.isGrid(initialStateOrGrid)) {
      // TODO(azizj): Should probably clone this before setting it.
      this.grid = initialStateOrGrid;
    }
  }

  private parseInitialState(initialState: string[]): Grid {
    const grid: Deque<Deque<Deque<boolean>>> = new ArrayDeque();
    grid.offerLast(new ArrayDeque());
    const plane = grid.peekLast()!;
    for (const row of initialState) {
      plane.offerLast(new ArrayDeque());
      for (const cell of row) {
        plane.peekLast()!.offerLast(cell === ACTIVE);
      }
    }
    return grid;
  }

  private isGrid(
    initialStateOrGrid?: string[] | Grid
  ): initialStateOrGrid is Grid {
    return typeof (initialStateOrGrid as Grid)?.offerFirst === 'function';
  }

  getCubeCount(): number {
    let count = 0;
    for (const plane of this.grid) {
      for (const line of plane) {
        for (const point of line) {
          if (point) {
            count++;
          }
        }
      }
    }
    return count;
  }

  toString() {
    let result = '';
    for (const [idx, plane] of this.grid.entries()) {
      result += `z=${idx}\n`;
      result += Array.from(plane)
        .map((row) =>
          Array.from(row)
            .map((active) => (active ? '#' : '.'))
            .join('')
        )
        .join('\n');
      result += '\n';
    }
    return result;
  }

  getNextCycle(): PocketDimension {
    this.maybeExpand();
    const nextGrid: Grid = new ArrayDeque();
    for (const [z, plane] of this.grid.entries()) {
      nextGrid.offerLast(new ArrayDeque());
      for (const [y, line] of plane.entries()) {
        nextGrid.peekLast()!.offerLast(new ArrayDeque());
        for (const [x, point] of line.entries()) {
          const newLine = nextGrid.peekLast()!.peekLast()!;
          const neighbors = this.getActiveNeighborsCount(x, y, z);
          // if point is active
          if (point) {
            if (neighbors === 2 || neighbors === 3) {
              newLine.offerLast(true);
            } else {
              newLine.offerLast(false);
            }
          } else if (neighbors === 3) {
            newLine.offerLast(true);
          } else {
            newLine.offerLast(false);
          }
        }
      }
    }

    return new PocketDimension(nextGrid);
  }

  /** When getting the next cycle, see if you need to expand before hand. */
  private maybeExpand() {
    const firstPlane = this.grid.peekFirst()!;
    const lastPlane = this.grid.peekLast()!;
    let expandGridBack = false;
    let expandGridForward = false;
    let addLinesOnTop = false;
    let addLinesOnBottom = false;
    let expandLinesForward = false;
    let expandLinesBackward = false;
    for (const plane of this.grid) {
      for (const pointOnFirstLine of plane.peekFirst()!) {
        if (pointOnFirstLine) {
          addLinesOnTop = true;
          break;
        }
      }
      for (const pointOnLastLine of plane.peekLast()!) {
        if (pointOnLastLine) {
          addLinesOnBottom = true;
        }
      }
      for (const line of plane) {
        if (line.peekLast()) {
          expandLinesForward = true;
        }
        if (line.peekFirst()) {
          expandLinesBackward = true;
        }
      }
    }
    for (const [y, line] of firstPlane.entries()) {
      for (const [x] of line.entries()) {
        if (this.getActiveNeighborsInPlaneIncludingSelf(x, y, 0) === 3) {
          expandGridBack = true;
          break;
        }
      }
    }
    for (const [y, line] of lastPlane.entries()) {
      for (const [x] of line.entries()) {
        if (this.getActiveNeighborsInPlaneIncludingSelf(x, y, 0) === 3) {
          expandGridForward = true;
          break;
        }
      }
    }

    if (expandLinesForward || expandLinesBackward) {
      for (const plane of this.grid) {
        for (const line of plane) {
          if (expandLinesForward) {
            line.offerLast(false);
          }
          if (expandLinesBackward) {
            line.offerFirst(false);
          }
        }
      }
    }

    const pointsPerLine = firstPlane.peekFirst()!.size;
    const emptyLine = Array.from({ length: pointsPerLine }, () => false);
    if (addLinesOnTop) {
      for (const plane of this.grid) {
        plane.offerFirst(new ArrayDeque([...emptyLine]));
      }
    }
    if (addLinesOnBottom) {
      for (const plane of this.grid) {
        plane.offerLast(new ArrayDeque([...emptyLine]));
      }
    }
    if (expandGridForward) {
      this.grid.offerLast(
        this.buildNewEmptyPlane(firstPlane.size, pointsPerLine)
      );
    }
    if (expandGridBack) {
      this.grid.offerFirst(
        this.buildNewEmptyPlane(lastPlane.size, pointsPerLine)
      );
    }
  }

  private buildNewEmptyPlane(lines: number, pointsPerLine: number) {
    const emptyLine = Array.from({ length: pointsPerLine }, () => false);
    return new ArrayDeque(
      Array.from({ length: lines }, () => new ArrayDeque([...emptyLine]))
    );
  }

  /** It keeps z constant, and counts current cell in the count. */
  private getActiveNeighborsInPlaneIncludingSelf(
    x: number,
    y: number,
    z: number
  ): number {
    let count = 0;
    const plane = this.grid.get(z)!;
    // prettier-ignore
    for (let j = Math.max(y - 1, 0); j <= Math.min(plane.size - 1, y + 1); j++) {
      const line = plane.get(j)!;
      for (let k = Math.max(x - 1, 0); k <= Math.min(line.size - 1, x + 1); k++) {
        // if is active
        if (line.get(k)) {
          count++;
        }
      }
    }
    return count;
  }

  private getActiveNeighborsCount(x: number, y: number, z: number): number {
    let count = 0;
    // prettier-ignore
    for (let i = Math.max(z - 1, 0); i <= Math.min(this.grid.size - 1, z + 1); i++) {
      const plane = this.grid.get(i)!;
      for (let j = Math.max(y - 1, 0); j <= Math.min(plane.size - 1, y + 1); j++) {
        const line = plane.get(j)!;
        for (let k = Math.max(x - 1, 0); k <= Math.min(line.size - 1, x + 1); k++) {
          // if is active
          if (line.get(k)) {
            count++;
          }
        }
      }
    }
    // if current cube is itself active, we have to take one off because we
    // counted it in the nest for loop above.
    if (this.grid.get(z)?.get(y)?.get(x)) {
      count--;
    }
    return count;
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
    current = current.getNextCycle();
  }
  return current.getCubeCount();
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(execute, `day 17 - ${sim.name}`, sim, 6);
}
