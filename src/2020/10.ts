import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './10.txt';

export interface Simulation {
  name: string;
  adapters: number[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    adapters: sim.content.map(Number),
  }));
}

function getDistributionOfJoltDifferences({ adapters }: Simulation): number[] {
  const distributions = [...adapters]
    .sort((a, b) => a - b)
    .reduce((distr, adapter, idx, sortedAdapters) => {
      const prev = sortedAdapters[idx - 1] ?? 0;
      if (distr[adapter - prev]) {
        distr[adapter - prev]++;
      } else {
        distr[adapter - prev] = 1;
      }
      return distr;
    }, [] as number[]);

  // your device is rated 3 jolts higher than max, so including that, your
  // 3-diff goes up by 1.
  distributions[3]++;
  return distributions;
}

function multiply(distr: number[]): number {
  return distr.filter((d) => !isNaN(d)).reduce((agg, curr) => curr * agg);
}

export function run() {
  const sim = getSimulations()[2];
  timer.run(
    pipe(getDistributionOfJoltDifferences, multiply),
    `day 10 - ${sim.name}`,
    sim
  );
}
