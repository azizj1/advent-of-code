import { intersect } from '~/util/sets';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './3.txt';

export interface Simulation {
  name: string;
  backpacks: [string, string, string][];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    backpacks: sim.content.reduce((arr, curr, idx) => {
      const groupedIdx = Math.floor(idx / 3);
      if (!arr[groupedIdx]) arr[groupedIdx] = ['', '', ''];
      arr[groupedIdx][idx % 3] = curr;
      return arr;
    }, [] as [string, string, string][]),
  }));
}

function isLowerCase(str: string) {
  return str.charCodeAt(0) >= 97;
}

function getScore(item: string) {
  return isLowerCase(item)
    ? item.charCodeAt(0) - 96
    : item.charCodeAt(0) - 65 + 27;
}

function getPrioritySum(sim: Simulation): number {
  let sum = 0;
  for (const backpack of sim.backpacks) {
    const common = intersect(
      new Set(backpack[0]),
      new Set(backpack[1]),
      new Set(backpack[2])
    );
    sum += getScore(Array.from(common)[0]);
  }
  return sum;
}

export function run() {
  declareProblem('2022 2a');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(getPrioritySum, sim.name, sim);
  }
}
