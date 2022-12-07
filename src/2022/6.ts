import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './6.txt';

interface Simulation {
  name: string;
  datastream: string;
  answer?: number;
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    datastream: sim.content[0],
    answer: sim.properties.has('answer')
      ? Number(sim.properties.get('answer')!)
      : undefined,
  }));
}

/**
 * @param n The window size.
 */
function firstMarkerLocation({ datastream }: Simulation, n: number) {
  // How often each letter appears.
  const map = new Map<string, number>();
  let countInWindow = 0;
  const decrement = (char: string) => {
    if (!map.has(char)) return;

    const remaining = assert(map.get(char)! - 1, (val) => val >= 0);
    if (remaining === 0) {
      map.delete(char);
    } else {
      map.set(char, remaining);
    }
    countInWindow--;
  };
  const increment = (char: string) => {
    countInWindow++;
    const count = map.get(char) ?? 0;
    map.set(char, count + 1);
  };

  for (let i = 0; i < n; i++) increment(datastream[i]);
  if (countInWindow === map.size) return n;

  for (let i = n; i < datastream.length; i++) {
    decrement(datastream[i - n]);
    increment(datastream[i]);
    if (countInWindow === map.size) return i + 1;
  }

  return Infinity;
}

export function run() {
  declareProblem('2022 6a');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(
      firstMarkerLocation,
      `${sim.name}, ans=${sim.answer ?? 'UNKNOWN'}`,
      sim,
      14
    );
  }
}
