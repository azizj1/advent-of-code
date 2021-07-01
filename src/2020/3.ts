import { timer } from '~/util/Timer';
import { Point } from '~/util/Point';
import { declareProblem, getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './3.txt';

const TREE = '#';
const SLOPE_KEY = 'slope';

interface Slope {
  right: number;
  down: number;
}

interface Simulation {
  name: string;
  slope: Slope;
  grid: string[]; // each string is a row.
}

function getSimulations() {
  return getRunsFromIniNewlineSep(input)
    .map(({ name, properties, content }) => {
      return properties
        .get(SLOPE_KEY)!
        .map((s) => s.split('/').map(Number))
        .map((s) => ({ right: s[0], down: s[1] }))
        .map((s) => ({
          name,
          slope: s,
          grid: content,
        }));
    })
    .flatMap((sim) => sim);
}

function isTree(grid: string[], loc: Point) {
  const width = grid[0].length;
  return grid[loc.y][loc.x % width] === TREE;
}

function getTreeCount({ grid, slope: { right, down } }: Simulation) {
  let count = 0,
    loc = new Point(0, 0);

  while (loc.y < grid.length) {
    if (isTree(grid, loc)) {
      count++;
    }
    loc = loc.add(right, down);
  }

  return count;
}

function multiply(nums: number[]) {
  return nums.reduce((agg, curr) => agg * curr, 1);
}

export function run() {
  const sims = getSimulations();
  declareProblem('day 3');
  sims.forEach((s) => timer.run(getTreeCount, s.name, s));

  declareProblem('day 3b');
  timer.run(
    pipe(() => sims.map(getTreeCount), multiply),
    'day 3b'
  );
}
