import { assert } from '~/util/assert';
import { Coordinate } from '~/util/Coordinate';
import { GenericSet } from '~/util/GenericSet';
import { SortedSet } from '~/util/SortedSet';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, last } from '~/util/util';
import input from './15.txt';

interface Simulation {
  name: string;
  sensorReadings: {
    sensor: Coordinate;
    closestBeacon: Coordinate;
  }[];
  beacons: GenericSet<Coordinate>;
  yaxis: number;
  maxXY: number;
}

interface Range {
  start: number; // inclusive
  end: number; // inclusive
}

function getSimulations(): Simulation[] {
  const sims = getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    yaxis: assert(Number(sim.properties.get('yaxis')), (n) => !isNaN(n)),
    maxXY: assert(Number(sim.properties.get('maxXY')), (n) => !isNaN(n)),
    sensorReadings: sim.content.map((c) => {
      const [, xs, ys, xb, yb] = assert(
        c.match(/^Sensor at x=(-?\d+), y=(-?\d+):.+x=(-?\d+), y=(-?\d+)/),
        (arr) => arr.length > 1,
        `${c} does not match.`
      ).map(Number);
      return {
        sensor: new Coordinate(xs, ys),
        closestBeacon: new Coordinate(xb, yb),
      };
    }),
  }));
  return sims.map((sim) => ({
    ...sim,
    beacons: new GenericSet<Coordinate>(
      (c) => c.toString(),
      sim.sensorReadings.map((s) => s.closestBeacon)
    ),
  }));
}

function positionsWithoutBeacon({ yaxis, sensorReadings }: Simulation) {
  const set = new SortedSet<Range>(
    (r) => `${r.start}-${r.end}`,
    (a, b) => a.start - b.start
  );
  for (const { sensor, closestBeacon } of sensorReadings) {
    const distance = Coordinate.manhattanDistance(sensor, closestBeacon);
    const dy = Math.abs(yaxis - sensor.y);
    const dx = distance - dy;
    if (dx <= 0) continue;
    set.add({
      start: sensor.x - dx,
      end: sensor.x + dx,
    });
  }
  return set;
}

function reduceRanges(ranges: SortedSet<Range>) {
  const sortedRanges = ranges.sortedValues;
  const reducedRanges = [sortedRanges[0]];
  for (let i = 1; i < sortedRanges.length; i++) {
    const { start: nstart, end: nend } = sortedRanges[i];
    const { start: pstart, end: pend } = last(reducedRanges)!;
    assert(nstart >= pstart, 'Range should have already been sorted.');
    if (nstart > pend) {
      reducedRanges.push(sortedRanges[i]);
    } else if (nend <= pend) {
      // the next range completely overlaps with the previous one because
      // [pstart, nstart, nend, pend]. Don't add it in the reduced ranges.
      continue;
    } else {
      // nstart is somewhere between [pstart+1, pend]
      // so it goes like this [pstart, nstart, pend, nend]
      reducedRanges.pop();
      reducedRanges.push({ ...sortedRanges[i], start: pstart, end: nend });
    }
  }
  return reducedRanges;
}

function countPointsInRange(ranges: Range[], { yaxis, beacons }: Simulation) {
  let count = ranges.reduce((sum, r) => sum + r.end - r.start + 1, 0);
  for (const beacon of beacons) {
    if (beacon.y === yaxis) count--;
  }
  return count;
}

export function run() {
  declareProblem('2022 day 15');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(() => {
      const ranges = reduceRanges(positionsWithoutBeacon(sim));
      console.log(ranges);
      console.log(countPointsInRange(ranges, sim));
    }, sim.name);
  }
}
