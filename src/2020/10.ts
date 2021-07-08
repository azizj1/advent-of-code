import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './10.txt';

interface Simulation {
  name: string;
}

function getSimulations(): Simulation[] {
  throw new Error('Not implemented.');
}

export function run() {
  const sim = getSimulations()[0];
  // TODO(azizj1)
}
