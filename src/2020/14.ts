/**
 * This problem was not fun to do in Javascript. None of the bit-wise operations
 * work after 32 bits. E.g., (1 << 33) doesn't return what you'd expect, and 1 |
 * 68719476736 also doesn't return what you'd expect (68719476736 is 2^36, so 36
 * bits).
 * I had to do a lot of bit manipulation myself, which meant converting a number
 * to its bit array via [...someNumber.toString(2)], and then mutating that
 * array to update the right bit, and then finally doing
 * parseInt(bitArrayMutated, 2).
 */
import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './14.txt';

interface Instruction {
  mask: {
    and: bigint;
    or: bigint;
  };
  address: number;
  value: bigint;
}

interface Simulation {
  name: string;
  instructions: Instruction[];
}

function isMask(ins: string) {
  return ins.indexOf('mask = ') === 0;
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

export function parseMask(ins: string) {
  const [, mask] = assert(ins.match(/^mask = (\w+)$/), (m) => m!.length > 1);
  let andComplement = BigInt(0);
  let or = BigInt(0);
  for (let i = mask.length - 1; i >= 0; i--) {
    // if mask.length = 32, and i = mask.length - 1, then shiftBy should equal
    // 0. You'd do 31 - 31. And as i decreases, you'd do 31 - 30 to get next
    // shiftBy, and so on.
    const shiftBy = mask.length - 1 - i;
    if (mask[i] === '0') {
      andComplement = andComplement | BigInt(1 << shiftBy);
    } else if (mask[i] === '1') {
      or = or | BigInt(1 << shiftBy);
    }
  }
  return {
    or,
    and: ~andComplement,
  };
}

function parseMask2(ins: string) {
  const [, mask] = assert(ins.match(/^mask = (\w+)$/), (m) => m!.length > 1);
  return {
    or: BigInt(parseInt(mask.replace(/[X0]/g, '0'), 2)),
    and: BigInt(parseInt(mask.replace(/[X1]/g, '1'), 2)),
  };
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    instructions: sim.content.reduce((all, ins, idx, unparsedIns) => {
      // if the current instruction is a mask or first one, skip it.
      // we'll deal with the instruction in the next if-statement.
      if (isMask(ins) || idx === 0) {
        return all;
      }
      const { address, value } = parseAddress(ins);
      // if the previous instruction was a mask, use that mask for the current
      // instruction. Otherwise, use the last parsed instruction and reuse that
      // instruction.
      const mask = isMask(unparsedIns[idx - 1])
        ? parseMask2(unparsedIns[idx - 1])
        : all[all.length - 1].mask;
      all.push({ address, value, mask });
      return all;
    }, [] as Instruction[]),
  }));
}

function initializeProgram({ instructions }: Simulation) {
  const addressValues = new Map<number, bigint>();
  for (const {
    address,
    value,
    mask: { and, or },
  } of instructions) {
    const result = (value | or) & and;
    addressValues.set(address, result);
  }
  return addressValues;
}

function sum(addressValues: Map<number, bigint>) {
  return Array.from(addressValues.values()).reduce((sum, curr) => sum + curr);
}

function toUnsignedNumber(val: bigint) {
  return val;
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(
    pipe(initializeProgram, sum, toUnsignedNumber),
    `day 14 - ${sim.name}`,
    sim
  );
}
