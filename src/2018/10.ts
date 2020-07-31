import input from './10.txt';
import {getRunsFromIniNewlineSep, declareProblem, declareSubproblem} from '~/util/util';
import {timer} from '~/util/Timer';

class Point {
  constructor(public x: number, public y: number) {}

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  // immutable add
  add(p: Point) {
    return new Point(this.x + p.x, this.y + p.y);
  }

  multiply(n: number) {
    return new Point(this.x * n, this.y * n);
  }
}

interface ISnapshot {
  start: Point;
  velocity: Point;
}

const rowRegex = /position=<([^,]+), ([^>]+)> velocity=<([^,]+), ([^>]+)>/;

export const getSimulations = () => getRunsFromIniNewlineSep(input).map(ini => ({
  name: ini.name,
  points: ini.content.map(row => {
    const [, px, py, vx, vy] = Array.from(row.match(rowRegex)!);
    return {
      start: new Point(Number(px), Number(py)),
      velocity: new Point(Number(vx), Number(vy))
    } as ISnapshot;
  })
}));

export const getPosition = (snapshots: ISnapshot[]) => (timeElapsed: number) => {
  return snapshots.map(s => ({
    start: s.start.add(s.velocity.multiply(timeElapsed)),
    velocity: s.velocity
  }));
};

export const getArea = (snapshots: ISnapshot[]) => {
  const minX = Math.min(...snapshots.map(s => s.start.x));
  const minY = Math.min(...snapshots.map(s => s.start.y));
  const maxX = Math.max(...snapshots.map(s => s.start.x));
  const maxY = Math.max(...snapshots.map(s => s.start.y));

  return (maxX - minX) * (maxY - minY);
};

export const display = (snapshots: ISnapshot[]) => {
  const minX = Math.min(...snapshots.map(s => s.start.x));
  const minY = Math.min(...snapshots.map(s => s.start.y));
  const grid: boolean[][] = [[]];
  for (const p of snapshots) {
    // this is important because if minY is like -40, we don't want to
    // put data in grid[-40], we want it to be grid[0].
    // Thus, we offset every x and y with the minX and minY
    const x = p.start.x - minX;
    const y = p.start.y - minY;
    if (grid[y] == null) {
      grid[y] = [];
    }
    grid[y][x] = true;
  }

  let printout = '';
  for (let i = 0; i < grid.length; i++) {
    // if no # in this row, still display the row, but just put `.`
    // at the beginning of the row
    if (grid[i] == null) {
      printout += '.';
    }
    else {
      // it's likely that each row in grid will be something like this:
      // [ <39 empty items>, '#', <10 empty items>, '#' ]
      // The length of this array is still 51, even though
      // it only has 2 items. We can't do grid[i].map(f) because f will
      // only be called on the 2 non-empty items--undesireable.
      for (let j = 0; j < grid[i].length; j++) {
        printout += grid[i][j] ? '#' : '.';
      }
    }
    printout += '\n';
  }
  return printout;
};

export const getMinAreaTime = (snapshots: ISnapshot[]) => {
  let curr = Infinity;
  let prev = Infinity;
  let time = 0;
  do {
    curr = getArea(getPosition(snapshots)(++time));
    if (curr > prev) {
      break;
    } else {
      prev = curr;
    }
  // eslint-disable-next-line
  } while(true);

  return { minArea: prev, minTime: time - 1 };
};

export const run = () => {
  declareProblem('day 10');
  const simulations = getSimulations();
  for (const sim of simulations) {
    declareSubproblem(sim.name);
    timer.start();
    const minInfo = getMinAreaTime(sim.points);
    console.log(timer.stop());
    console.log(minInfo);
    console.log(display(getPosition(sim.points)(minInfo.minTime)));
  }
};
