import { mod } from '~/util/math';
import { timer } from '~/util/Timer';
import { declareProblem, pipe } from '~/util/util';
import { getSimulations, Simulation } from './20-linkedlist';

const DECRYPTION_KEY = 811589153;

function mult(sim: Simulation) {
  for (let i = 0; i < sim.file.length; i++) {
    sim.file[i] *= DECRYPTION_KEY;
  }
  return sim;
}

/**
 * Maintain two arrays:
 *    1. One that has just the values (that we call file, and that remains unchanged).
 *       This also tells us what's the original index of those values. These
 *       indices are important for #2.
 *    2. The second array has values that are indices of the array #1. So
 *       originally, this array is just [0,1,2,3,...,n]. This is the array we
 *       shift around as we iterate through the original array #1.
 */
function mix(sim: Simulation): Simulation {
  const { indices, file } = sim;
  const n = file.length;
  for (const [idx, shift] of file.entries()) {
    const from = indices.indexOf(idx);
    const to = mod(from + shift, n - 1);
    if (to === from) continue;

    const removed = indices.splice(from, 1);
    indices.splice(to, 0, ...removed);
  }
  return {
    ...sim,
    indices,
  };
}

function groveCoordinates(sim: Simulation) {
  const { indices, file } = sim;
  const movedFile = indices.map((idx) => file[idx]);
  const n = file.length;
  const zeroIdx = movedFile.indexOf(0);
  return [1000, 2000, 3000]
    .map((v) => movedFile[(zeroIdx + v) % n])
    .reduce((sum, curr) => sum + curr);
}

export function run() {
  let sims = getSimulations();
  declareProblem('2022 day 20');
  for (const sim of sims) {
    timer.run(pipe(mix, groveCoordinates), sim.name, sim);
  }
  sims = getSimulations();
  declareProblem('2022 day 20 part two');
  for (const sim of sims) {
    timer.run(
      pipe(mult, ...Array.from({ length: 10 }, () => mix), groveCoordinates),
      sim.name,
      sim
    );
  }
}
