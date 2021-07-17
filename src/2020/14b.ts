import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './14.txt';

interface Mask {
  or: number; // rest of the 0s and 0s are ORs.
  floatersAt: number[]; // indexes of the X's.
}

interface Instruction {
  address: number;
  value: bigint;
  mask: Mask;
}

interface Simulation {
  name: string;
  instructions: Instruction[];
}

function parseAddress(ins: string) {
  const matches = assert(
    ins.match(/^mem\[(\d+)\] = (\d+)$/),
    `Address ${ins} could not be parsed.`
  );
  return {
    address: Number(matches[1]),
    value: BigInt(matches[2]),
  };
}

function isMask(ins: string) {
  return ins.indexOf('mask = ') === 0;
}

function parseMask(ins: string) {
  const mask = ins.split(' = ')[1];
  const or = parseInt(mask.replace(/X/g, '0'), 2);
  const floatersAt = [...mask]
    .map<[string, number]>((m, idx) => [m, idx])
    .filter(([m]) => m === 'X')
    .map<number>(([, idx]) => mask.length - 1 - idx);
  return { or, floatersAt };
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    instructions: sim.content.reduce((all, ins, idx, unparsedAll) => {
      // if the current instruction is a mask or first one, skip it.
      // we'll deal with the instruction in the next if-statement.
      if (isMask(ins) || idx === 0) {
        return all;
      }
      const { address, value } = parseAddress(ins);
      const mask = isMask(unparsedAll[idx - 1])
        ? parseMask(unparsedAll[idx - 1])
        : all[all.length - 1].mask;
      all.push({ address, value, mask });
      return all;
    }, [] as Instruction[]),
  }));
}

function setBit(num: number, bit: number) {
  const numBits = [...num.toString(2)];
  while (numBits.length <= bit) {
    numBits.push('0');
  }
  numBits[numBits.length - 1 - bit] = '1';
  return parseInt(numBits.join(''), 2);
}

function initializeProgram({ instructions }: Simulation) {
  const memory = new Map<number, bigint>();
  const writeToMemory = (address: number, value: bigint) => {
    memory.set(address, value);
  };
  const helper = (
    address: number,
    floatersAt: number[],
    floaterIdx: number,
    value: bigint
  ) => {
    if (floaterIdx === floatersAt.length) {
      writeToMemory(address, value);
      return;
    }
    const bitIdx = floatersAt[floaterIdx];
    helper(address, floatersAt, floaterIdx + 1, value);
    helper(setBit(address, bitIdx), floatersAt, floaterIdx + 1, value);
  };
  for (const { address, value, mask } of instructions) {
    let addressOr = address | mask.or;
    let addressArray = [...addressOr.toString(2)];
    for (const floaterIdx of mask.floatersAt) {
      if (floaterIdx < addressArray.length) {
        addressArray[addressArray.length - 1 - floaterIdx] = '0';
      }
    }
    addressOr = parseInt(addressArray.join(''), 2);
    helper(addressOr, mask.floatersAt, 0, value);
  }
  return memory;
}

function sum(addressValues: Map<string, bigint>) {
  console.log(addressValues.size);
  return Array.from(addressValues.values()).reduce((sum, curr) => sum + curr);
}

export function run() {
  declareProblem('day 14b');
  const sim = getSimulations()[1];
  timer.run(pipe(initializeProgram, sum), `day 14b - ${sim.name}`, sim);
}
