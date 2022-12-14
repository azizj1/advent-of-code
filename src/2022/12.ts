import { Coordinate } from '~/util/Coordinate';
import { GenericSet } from '~/util/GenericSet';
import { Queue } from '~/util/Queue';
import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './12.txt';

interface Simulation {
  name: string;
  grid: Heightmap;
}

class Heightmap {
  // grid[y][x] = elevation level, where y is the y-coordinate, or the row, and
  // x is the x-coordinate, or the column.
  private readonly grid: number[][];
  private readonly starting = new Coordinate();
  private readonly ending = new Coordinate();

  constructor(grid: string[]) {
    this.grid = [];
    const baseCharCode = 'a'.charCodeAt(0);
    for (let y = 0; y < grid.length; y++) {
      const line = grid[y];
      const row: number[] = [];
      for (let x = 0; x < line.length; x++) {
        const square = line[x];
        if (square === 'S') {
          this.starting = new Coordinate(x, y);
          row.push(-1);
        } else if (square === 'E') {
          this.ending = new Coordinate(x, y);
          row.push(26);
        } else {
          row.push(square.charCodeAt(0) - baseCharCode);
        }
      }
      this.grid.push(row);
    }
  }

  getAccessibleSquares(from: Coordinate) {
    const { x, y } = from;
    const elevation = this.grid[y][x];
    return [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]
      .map(([dx, dy]) => ({
        point: new Coordinate(x + dx, y + dy),
        elevation: this.grid[y + dy]?.[x + dx],
      }))
      .filter((sq) => sq.elevation - elevation <= 1);
  }

  getStarting() {
    return {
      point: this.starting.clone(),
      elevation: this.grid[this.starting.y][this.starting.x],
    };
  }

  getEnding() {
    return {
      point: this.ending.clone(),
      elevation: this.grid[this.ending.y][this.ending.x],
    };
  }

  toString() {
    return this.grid
      .map((row) => row.map((c) => c.toString().padStart(2, '0')).join(','))
      .join('\n');
  }
}

function getMinStepsToEnd({ grid }: Simulation) {
  type QueueItem = { point: Coordinate; steps: number; elevation: number };
  const queue = new Queue<QueueItem>();
  const visited = new GenericSet<Coordinate>((c) => c.toString());

  const ending = grid.getEnding();
  queue.enqueue({ ...grid.getStarting(), steps: 0 });
  while (!queue.isEmpty()) {
    const { point, steps, elevation } = queue.dequeue()!;
    if (elevation === ending.elevation) {
      return steps;
    }
    const squares = grid.getAccessibleSquares(point);
    const nextSteps = steps + 1;
    for (const { elevation, point } of squares) {
      if (!visited.has(point)) {
        queue.enqueue({ elevation, point, steps: nextSteps });
        visited.add(point);
      }
    }
  }
  return -1;
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    grid: new Heightmap(sim.content),
  }));
}

export function run() {
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(getMinStepsToEnd, sim.name, sim);
  }
}
