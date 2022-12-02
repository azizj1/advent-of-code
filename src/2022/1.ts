import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, last } from '~/util/util';
import input from './1.txt';

interface Elf {
  calories: number[];
}

export interface Simulation {
  name: string;
  elves: Elf[];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    elves: sim.content.reduce(
      (arr, curr) => {
        if (curr === '-') {
          arr.push({ calories: [] });
        } else {
          last(arr).calories.push(Number(curr));
        }
        return arr;
      },
      [{ calories: [] }] as Elf[]
    ),
  }));
}

export function mostCalories(elves: Elf[]): number {
  let max = 0;
  for (const elf of elves) {
    const totalCalories = elf.calories.reduce((sum, curr) => sum + curr, 0);
    max = Math.max(max, totalCalories);
  }
  return max;
}

export function topMostCalories(elves: Elf[], n: number) {
  return elves
    .map((e) => e.calories.reduce((sum, curr) => sum + curr, 0))
    .sort((a, b) => a - b)
    .reverse()
    .slice(0, n)
    .reduce((sum, curr) => sum + curr, 0);
}

export function run() {
  declareProblem('2022 1a');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run((e) => topMostCalories(e, 3), sim.name, sim.elves);
  }
}
