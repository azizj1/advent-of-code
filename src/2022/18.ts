import { assert } from '~/util/assert';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './18.txt';

type Point = [number, number, number];

interface Simulation {
  name: string;
  points: Point[];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    points: sim.content.map<Point>(
      (line) =>
        assert(
          line.split(',').map(Number),
          (n) => n.length === 3 && n.every((p) => !isNaN(p))
        ) as Point
    ),
  }));
}

function distance(p1: Point, p2: Point) {
  return (
    Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) + Math.abs(p1[2] - p2[2])
  );
}

export function getSurfaceArea(sim: Simulation) {
  let surfaceArea = 0;
  for (let i = 0; i < sim.points.length; i++) {
    let touching = 0;
    for (let j = 0; j < sim.points.length; j++) {
      if (j == i) continue;
      if (distance(sim.points[i], sim.points[j]) === 1) touching++;
    }
    surfaceArea += 6 - touching;
  }
  return surfaceArea;
}

function atminmax(n: number, minmax: number[]) {
  return n === minmax[0] || n === minmax[1];
}

function getSurfaceArea2(sim: Simulation) {
  const xminmax = sim.points.reduce(
    (minmax, p) => [Math.min(p[0], minmax[0]), Math.max(p[0], minmax[1])],
    [Infinity, -Infinity]
  );
  const yminmax = sim.points.reduce(
    (minmax, p) => [Math.min(p[1], minmax[0]), Math.max(p[1], minmax[1])],
    [Infinity, -Infinity]
  );
  const zminmax = sim.points.reduce(
    (minmax, p) => [Math.min(p[2], minmax[0]), Math.max(p[2], minmax[1])],
    [Infinity, -Infinity]
  );
  console.log('xmimax', xminmax, 'yminmax', yminmax, 'zminmax', zminmax);
  let surfaceArea = 0;
  for (let i = 0; i < sim.points.length; i++) {
    const [x, y, z] = sim.points[i];
    if (
      !atminmax(x, xminmax) &&
      !atminmax(y, yminmax) &&
      !atminmax(z, zminmax)
    ) {
      console.log('not in bounds', sim.points[i]);
      continue;
    }
    let touching = 0;

    for (let j = 0; j < sim.points.length; j++) {
      if (j == i) continue;
      if (distance(sim.points[i], sim.points[j]) === 1) touching++;
    }
    surfaceArea += 6 - touching;
  }
  return surfaceArea;
}

export function run() {
  declareProblem('2022 day 18');
  const sims = getSimulations().slice(0, 1);
  for (const sim of sims) {
    console.log(getSurfaceArea2(sim));
  }
}
