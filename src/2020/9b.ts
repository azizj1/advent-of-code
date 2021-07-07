import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { pipe } from '~/util/util';
import { getSimulations, Simulation, getInvalidNumber } from './9';

interface SimulationPartB extends Simulation {
  sumTo: number;
}

function toPartBSimulation(sim: Simulation): SimulationPartB {
  return {
    ...sim,
    sumTo: getInvalidNumber(sim),
  };
}

function findContiguousSum({ sumTo, xmasData }: SimulationPartB): number[] {
  // we don't need to iterate through the entire xmasData, just until the index
  // where the invalidNumber (or sumTo) is.
  const idx = assert(
    xmasData.findIndex((d) => d === sumTo),
    (idx) => idx > -1
  );
  const cumulativeSum = xmasData
    .slice(0, idx + 1)
    .reduce(
      (cumSum, curr) => {
        cumSum.push(cumSum[cumSum.length - 1] + curr);
        return cumSum;
      },
      [0] // add an artificial 0, that we remove after the reduce.
    )
    .slice(1); // remove the first element, which is 0.

  const workingSet = new Map<number, number>(); // cumSum[i] -> i
  for (let i = 0; i < cumulativeSum.length; i++) {
    if (workingSet.has(cumulativeSum[i] - sumTo)) {
      return xmasData.slice(
        workingSet.get(cumulativeSum[i] - sumTo)! + 1,
        i + 1
      );
    }
    workingSet.set(cumulativeSum[i], i);
  }
  throw new Error('No contiguous sum found.');
}

function getEncyptionWeakness(range: number[]) {
  return Math.min(...range) + Math.max(...range);
}

function print<T, E>(sanitize?: (data: T) => E): (data: T) => T {
  return (d) => {
    console.log(sanitize?.(d) ?? d);
    return d;
  };
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(
    pipe(
      toPartBSimulation,
      print((s: SimulationPartB) => `sumTo ${s.sumTo}`),
      findContiguousSum,
      print(),
      getEncyptionWeakness
    ),
    'day 9b',
    sim
  );
}
