import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './13.txt';

type Packet = number | Packet[];

interface Simulation {
  name: string;
  packets: Packet[];
}

function getSimulations(): Simulation[] {
  const sims = getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    packets: sim.content.map((line) => {
      const packet = line.replace(/({|})/g, (val) => (val === '{' ? '[' : ']'));
      return JSON.parse(packet);
    }),
  }));
  for (const sim of sims) {
    sim.packets.push([[2]]);
    sim.packets.push([[6]]);
  }
  return sims;
}

/**
 * Does left - right, so
 * @return 1 if left > right; 0 if left === right; -1 if left < right.
 */
function packetComparator(
  left: Packet | undefined,
  right: Packet | undefined
): -1 | 0 | 1 {
  // if left is shorter, then we're in the right order.
  if (left === undefined) return -1;
  if (right === undefined) return 1;
  if (typeof left === 'number' && typeof right === 'number') {
    if (left === right) return 0;
    return left > right ? 1 : -1;
  }
  if (typeof left === 'number') left = [left];
  if (typeof right === 'number') right = [right];

  const n = Math.max(left.length, right.length);
  for (let i = 0; i < n; i++) {
    const result = packetComparator(left[i], right[i]);
    if (result !== 0) return result;
  }
  return 0;
}

function sort(sim: Simulation) {
  sim.packets.sort(packetComparator);
  return sim;
}

function print(sim: Simulation) {
  if (sim.packets.length > 20) return sim;
  for (const packet of sim.packets) {
    console.log(JSON.stringify(packet));
  }
  return sim;
}

function getDecoderKey(sim: Simulation) {
  let decoderKey = 1;
  for (let i = 0; i < sim.packets.length; i++) {
    const packet = sim.packets[i];
    const meetsCriteria =
      Array.isArray(packet) &&
      packet.length === 1 &&
      Array.isArray(packet[0]) &&
      packet[0].length === 1;
    if (
      meetsCriteria &&
      ((packet as number[][])[0][0] === 2 || (packet as number[][])[0][0] === 6)
    ) {
      decoderKey *= i + 1;
    }
  }
  return decoderKey;
}

export function run() {
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(pipe(sort, print, getDecoderKey), sim.name, sim);
  }
}
