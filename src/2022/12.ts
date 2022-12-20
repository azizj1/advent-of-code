import assert from 'assert';
import { Coordinate } from '~/util/Coordinate';
import { GenericSet } from '~/util/GenericSet';
import { PriorityQueue } from '~/util/PriorityQueue';
import { Queue } from '~/util/Queue';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
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
    assert(grid.every((g) => g.length === grid[0].length));
    this.grid = [];
    const baseCharCode = 'a'.charCodeAt(0);
    for (let y = 0; y < grid.length; y++) {
      const line = grid[y];
      const row: number[] = [];
      for (let x = 0; x < line.length; x++) {
        const square = line[x];
        if (square === 'S') {
          this.starting = new Coordinate(x, y);
          row.push(0);
        } else if (square === 'E') {
          this.ending = new Coordinate(x, y);
          row.push(25);
        } else {
          row.push(square.charCodeAt(0) - baseCharCode);
        }
      }
      this.grid.push(row);
    }
    assert(this.grid.every((g) => g.length === this.grid[0].length));
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

  getPointsAtElevation(elevation: number) {
    const points: Coordinate[] = [];
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] === elevation) {
          points.push(new Coordinate(x, y));
        }
      }
    }
    return points;
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

export function getMinStepsToEnd({ grid }: Simulation) {
  type QueueItem = { point: Coordinate; steps: number; elevation: number };
  const queue = new PriorityQueue<QueueItem>((item) => -item.steps);
  const visited = new GenericSet<Coordinate>((c) => c.toString());
  const ending = grid.getEnding();

  queue.enqueue({ ...grid.getStarting(), steps: 0 });
  // Make sure to add the starting node in visited before the while-loop.
  visited.add(grid.getStarting().point);
  while (!queue.isEmpty()) {
    const { point, steps, elevation } = queue.dequeue()!;
    // For any BFS or Dijkstra, make sure your return statement is here, and NOT
    // in the for-loop below. Your queue will dequeue the best solution. In your
    // for-loop, it might meet your exit condition, but it might be suboptimal.
    if (elevation === ending.elevation) {
      return steps;
    }
    const squares = grid.getAccessibleSquares(point);
    const nextSteps = steps + 1;
    for (const { elevation, point } of squares) {
      // If the priority queue heap was min/max on something other than steps
      // (which BFS already does, and why this could just be a BFS solution),
      // your visited collection should be a MAP, not a Set! E.g.,
      // if (!visited.has(point) || visited.get(point) > measurement)
      // In other words, even if it's visited, if this visitation of the node
      // has a better solution, then add it to your queue.
      if (!visited.has(point)) {
        queue.enqueue({ elevation, point, steps: nextSteps });
        // visited should be added inside the for-loop, not outside of the
        // for-loop. Otherwise your Set/Map will explode and youll get a out of
        // memory exception.
        visited.add(point);
      }
    }
  }
  return -Infinity;
}

export function getMinStepsToEnd2({ grid }: Simulation) {
  type QueueItem = { point: Coordinate; steps: number; elevation: number };
  const queue = new Queue<QueueItem>();
  const visited = new GenericSet<Coordinate>((c) => c.toString());
  const ending = grid.getEnding();

  queue.enqueue({ ...grid.getStarting(), steps: 0 });
  visited.add(grid.getStarting().point);
  while (!queue.isEmpty()) {
    const { point, steps, elevation } = queue.dequeue()!;
    // Returning at the first exit node usually isn't correct for BFS, but
    // because we're trying to optimize steps from starting node, BFS will
    // naturally optimize that so we can exit as soon as we get there.
    if (elevation === ending.elevation) {
      // Usually you should do
      // min = Math.min(min, steps);
      // but that isn't necessary because we're just miniming steps, not some
      // other parameter.
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
  return -Infinity;
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    grid: new Heightmap(sim.content),
  }));
}

export function run() {
  declareProblem('2022 day 12');
  const sims = getSimulations();
  // My answer for the example is off by 1 because the 'z' next to the 'E' have
  // the same weight. I should've not converted the letters to numbers because
  // 'z' and 'E' have the same elevation of 26, but we still need to get to 'E'.
  // And we can't make 'E' have an elevation for 27, because we don't
  // necessarily need to go to 'z' first.
  for (const sim of sims) {
    timer.run(getMinStepsToEnd2, sim.name, sim);
  }
}
