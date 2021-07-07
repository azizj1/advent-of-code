import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './9.txt';

export interface Simulation {
  name: string;
  preamble: number;
  xmasData: number[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    preamble: Number(sim.properties.get('preamble')),
    xmasData: sim.content.map(Number),
  }));
}

export function getInvalidNumber({ preamble, xmasData }: Simulation) {
  for (let i = preamble; i < xmasData.length; i++) {
    const sumTo = xmasData[i];
    const workingSet = new Set<number>();
    let found = false;
    for (let j = i - preamble; j < i; j++) {
      if (workingSet.has(sumTo - xmasData[j])) {
        found = true;
        break;
      }
      workingSet.add(xmasData[j]);
    }
    if (!found) {
      return sumTo;
    }
  }
  throw new Error('unable to break cypher.');
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(getInvalidNumber, 'day 9a', sim);
}
