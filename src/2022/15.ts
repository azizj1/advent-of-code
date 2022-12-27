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

function positionsWithoutBeacon(
  { sensorReadings }: Simulation,
  yaxis: number
): SortedSet<Range> {
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

/**
 * @param ranges Set of sorted ranges that are potentially overlapping.
 * @return Ranges that are mutually exclusive.
 * Example: [[1,2],[2,5],[7,9]] -> [[1,5],[7,9]]
 *          [[1,6],[2,4]]       -> [[1,6]]
 */
function reduceRanges(ranges: SortedSet<Range>): Range[] {
  const sortedRanges = ranges.sortedValues;
  const reducedRanges = [sortedRanges[0]];
  for (let i = 1; i < sortedRanges.length; i++) {
    const { start: nstart, end: nend } = sortedRanges[i];
    const { start: pstart, end: pend } = last(reducedRanges)!;
    assert(nstart >= pstart, 'Range should have already been sorted.');
    // If there's no overlap between prev and next, just push the next one.
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

// part 2
/**
 * @param ranges Sorted ranges that are already reduced to the minimum ranges.
 * @return The inverse of the ranges listed. E.g.,
 *    * ranges = [{start: 20, end: 35}], bounds: {min: 0, max: 40}. It'll return
 *        [{start: 0, end: 19}, {start: 36, end: 40}]
 *    * ranges = [{start: 15, end: 20}, {start: 25, end: 30}], bounds: [0, 40]
 *        [{start: 0, end: 14}, {start: 21, end: 24}, {start: 31, end: 40}]
 *    * ranges = [{start: -5, end: 10}, {start: 35, end: 40}], bounds: [0, 40]
 *        [{start: 11, end: 34}]
 */
function getComplement(
  ranges: Range[],
  bounds: { min: number; max: number }
): Range[] {
  const { min, max } = bounds;
  ranges = ranges.filter((range) => range.end >= min && range.start < max);
  if (ranges.length === 0) return [{ start: min, end: max }];
  const inverseRanges: Range[] = [];
  let start = ranges[0].start <= min ? ranges[0].end + 1 : 0;
  for (let i = 0; i <= ranges.length; i++) {
    // implies the end of the previous one was at max or greater.
    if (start > max) break;
    if (!ranges[i]) {
      // There is no next one, and range[i].end had to be
      inverseRanges.push({ start, end: max });
    } else if (start >= ranges[i].start) {
      // Happens if {start: 4, end: 5}, {start: 6, end: 8}
      // There's no complement between 5 and 5, so continue.
      start = ranges[i].end + 1;
      continue;
    } else {
      // start has to be < max because of the filter.
      const end = ranges[i].start - 1;
      inverseRanges.push({ start, end });
      start = ranges[i].end + 1;
    }
  }
  return inverseRanges;
}

function findDistressedBeacon(sim: Simulation) {
  const min = 0;
  const { maxXY: max } = sim;
  let coordinate = new Coordinate();
  for (let y = 0; y <= max; y++) {
    const ranges = reduceRanges(positionsWithoutBeacon(sim, y));
    console.log(
      y,
      ranges,
      ranges.reduce((sum, curr) => sum + curr.end - curr.start, 0)
    );
    const complement = getComplement(ranges, { min, max });
    if (complement.length > 1) {
      throw new Error('Multiple ranges found.');
    } else if (complement.length === 1) {
      console.log('FOUND IT!');
      coordinate = new Coordinate(
        assert(
          complement[0].start,
          (n) => n === complement[0].end,
          'Range has multiple points on x-axis.'
        ),
        y
      );
    }
  }
  return coordinate;
  // throw new Error('Distressed beacon not found.');
}

export function run() {
  declareProblem('2022 day 15');
  const sims = getSimulations().slice(0, 1);
  for (const sim of sims) {
    timer.run(() => {
      const ranges = reduceRanges(positionsWithoutBeacon(sim, sim.yaxis));
      console.log(ranges);
      console.log(countPointsInRange(ranges, sim));
    }, sim.name);
  }

  declareProblem('2022 day15 part 2');
  for (const sim of sims) {
    timer.run(() => {
      const beacon = findDistressedBeacon(sim);
      const tuningFrequency = beacon.x * sim.maxXY + beacon.y;
      console.log(beacon, tuningFrequency);
    }, sim.name);
  }
}

const TEST_COMPLEMENT_SCENARIOS = [
  {
    ranges: [{ start: 20, end: 35 }],
    bounds: { min: 0, max: 40 },
    expected: [
      { start: 0, end: 19 },
      { start: 36, end: 40 },
    ],
  },
  {
    ranges: [
      { start: 15, end: 20 },
      { start: 25, end: 30 },
    ],
    bounds: { min: 0, max: 40 },
    expected: [
      { start: 0, end: 14 },
      { start: 21, end: 24 },
      { start: 31, end: 40 },
    ],
  },
  {
    ranges: [
      { start: -5, end: 10 },
      { start: 35, end: 40 },
    ],
    bounds: { min: 0, max: 40 },
    expected: [{ start: 11, end: 34 }],
  },
];

export function test() {
  declareProblem('2022 15 test');
  for (const { ranges, bounds, expected } of TEST_COMPLEMENT_SCENARIOS) {
    console.log(
      'input',
      ranges,
      '\nactual',
      getComplement(ranges, bounds),
      '\nexpected',
      expected,
      '\n'
    );
  }
}
