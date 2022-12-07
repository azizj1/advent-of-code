import assert from 'assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './3.txt';

export interface Simulation {
  name: string;
  backpacks: string[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    backpacks: sim.content,
  }));
}

function isLowerCase(str: string) {
  return str.charCodeAt(0) >= 97;
}

function getPrioritySum(sim: Simulation): number {
  let sum = 0;
  loop1: for (const backpack of sim.backpacks) {
    assert(backpack.length % 2 === 0, 'Backpack must have even length');
    const firstCompartment = new Set<string>();
    for (let i = 0; i < backpack.length / 2; i++) {
      firstCompartment.add(backpack[i]);
    }
    for (let i = backpack.length / 2; i < backpack.length; i++) {
      const item = backpack[i];
      if (firstCompartment.has(item)) {
        const score = isLowerCase(item)
          ? item.charCodeAt(0) - 96
          : item.charCodeAt(0) - 65 + 27;
        console.log(item, isLowerCase(item), score);
        sum += score;
        continue loop1;
      }
    }
  }
  return sum;
}

export function run() {
  declareProblem('2022 2a');
  const sims = getSimulations().slice(0, 1);
  for (const sim of sims) {
    timer.run(getPrioritySum, sim.name, sim);
  }
}
