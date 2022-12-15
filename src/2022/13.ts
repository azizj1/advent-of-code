import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { getRunsFromIniEmptyLineSep, pipe } from '~/util/util';
import input from './13.txt';

type Packet = number | Packet[];

interface Simulation {
  name: string;
  pairs: [Packet, Packet][];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniEmptyLineSep(input).map((sim) => ({
    name: sim.name,
    pairs: sim.content.map((pair) => {
      const [packet1, packet2] = assert(
        pair
          .map((packet) =>
            packet.replace(/({|})/g, (val) => (val === '{' ? '[' : ']'))
          )
          .map((packet) => JSON.parse(packet)),
        (pair) => pair.length === 2
      );
      return [packet1, packet2];
    }),
  }));
}

function getIndicesInRightOrder(sim: Simulation) {
  const indicesInRightOrder = new Set<number>();

  const isLeftSmaller = (
    left: Packet | undefined,
    right: Packet | undefined
  ): 'yes' | 'no' | 'idk' => {
    // if left is shorter, then we're in the right order.
    if (left === undefined) return 'yes';
    if (right === undefined) return 'no';
    if (typeof left === 'number' && typeof right === 'number') {
      if (left === right) return 'idk';
      return left < right ? 'yes' : 'no';
    }
    if (typeof left === 'number') left = [left];
    if (typeof right === 'number') right = [right];

    const n = Math.max(left.length, right.length);
    for (let i = 0; i < n; i++) {
      const result = isLeftSmaller(left[i], right[i]);
      if (result === 'yes' || result === 'no') return result;
    }
    return 'idk';
  };

  for (let i = 0; i < sim.pairs.length; i++) {
    const [p1, p2] = sim.pairs[i];
    if (!Array.isArray(p1) || !Array.isArray(p2))
      throw new Error('need to be an array');

    const result = isLeftSmaller(p1, p2);
    if (result !== 'no') {
      indicesInRightOrder.add(i + 1);
    }
  }
  return indicesInRightOrder;
}

function sum(set: Set<number>) {
  return Array.from(set).reduce((total, curr) => total + curr);
}

export function run() {
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(pipe(getIndicesInRightOrder, sum), sim.name, sim);
  }
}
