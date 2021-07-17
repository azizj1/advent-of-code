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
import { declareProblem, getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './14.txt';

interface Mask {
  or: number; // rest of the 0s and 0s are ORs.
  floatersAt: number[]; // indexes of the X's.
}

interface Instruction {
  address: number;
  value: number;
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
    value: Number(matches[2]),
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
    numBits.unshift('0');
  }
  // If we wan to set the 30th bit, we don't do numBits[30] (which may not even
  // exist). We need the 30th bit from the BACK of the array. We do the
  // unshifting above to make sure that bit does exist.
  numBits[numBits.length - 1 - bit] = '1';
  return parseInt(numBits.join(''), 2);
}

function initializeProgram({ instructions }: Simulation) {
  const memory = new Map<number, number>();
  const writeToMemory = (address: number, value: number) => {
    memory.set(address, value);
  };
  const helper = (
    address: number,
    floatersAt: number[],
    floaterIdx: number,
    value: number
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
    const orArray = [...mask.or.toString(2)];
    const addressArray = [...address.toString(2)];
    for (let i = 0; i < orArray.length; i++) {
      if (orArray[i] === '1') {
        // if the index 0 is set to '1', the bit we're trying to set depends on
        // the length of the orArray. If it has a length of 4, then we're
        // setting the 2^3 bit. We need to know what bit we're setting.
        const orBit = orArray.length - 1 - i;
        // if we're setting the 30th bit, but address is just the number 64, we
        // need to add lots of zeros in front.
        while (addressArray.length <= orBit) {
          addressArray.unshift('0');
        }
        // Again, if we're setting the 3rd bit, it's not addressArray[3], since
        // the binary to string is backwards. addressArray[3] would correspond
        // to the 4th last bit. If the Array is
        // 011101110011010101000001
        //                     ^
        //                    bit
        // which has an index of addressArray.length - 1 - bit
        addressArray[addressArray.length - 1 - orBit] = '1';
      }
    }
    for (const floaterIdx of mask.floatersAt) {
      if (floaterIdx < addressArray.length) {
        // we do this subtraction math to deal with the reverse string
        // representation of the toString(2).
        addressArray[addressArray.length - 1 - floaterIdx] = '0';
      }
    }
    helper(parseInt(addressArray.join(''), 2), mask.floatersAt, 0, value);
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
