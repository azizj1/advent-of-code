import { timer } from '~/util/Timer';
import { getRunsFromIniCommaSep, pipe } from '~/util/util';
import input from './13.txt';

export interface Simulation {
  name: string;
  earliestDepature: number;
  // NaN means 'x'
  busSchedule: number[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniCommaSep(input).map((sim) => ({
    name: sim.name,
    earliestDepature: Number(sim.properties.get('earliestDepature')![0]),
    busSchedule: sim.content.map(Number),
  }));
}

function getEarliestBus({ earliestDepature, busSchedule }: Simulation) {
  return (
    busSchedule
      .filter((b) => !isNaN(b)) // remove all the 'x's
      // find the next depatures of each bus after earliestDeparture
      .map<[number, number]>((b) => [b, Math.ceil(earliestDepature / b) * b])
      // add the wait time
      .map<[number, number, number]>(([b, nextDeparture]) => [
        b,
        nextDeparture,
        nextDeparture - earliestDepature,
      ])
      .reduce((min, curr) => (min[1] > curr[1] ? curr : min))
  );
}

function multiply([busId, , waitTime]: [number, number, number]) {
  return busId * waitTime;
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(pipe(getEarliestBus, multiply), `day 13 - ${sim.name}`, sim);
}
