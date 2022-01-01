import { assert } from '~/util/assert';
import { declareProblem } from '~/util/util';
/*
 * Your task is to make 100 by placing pluses and minuses in the string of
 * digits 9 8 7 6 5 4 3 2 1 in that order. But that’s not actually your only
 * task. To get full credit on this puzzle, you must find the least number of
 * pluses and minuses needed to get to 100.
 */

type PlusMinus = '+' | '-';
type PlusMinusEmpty = PlusMinus | '';
const NUMBERS = ['9', '8', '7', '6', '5', '4', '3', '2', '1'];

export function getSum(locations: PlusMinusEmpty[]) {
  assert(locations.length === 8);
  let lastSymbol: PlusMinus | undefined = undefined;
  let lastSymbolIdx = 0;
  let sum = 0;
  for (let i = 0; i < locations.length; i++) {
    const symbol = locations[i];
    // plus/minus at index 0 means that it adds 9 + 98765...
    // plus/minus at index 1 means it adds 98 + 765
    if (symbol === '+' || symbol === '-') {
      const num = Number(NUMBERS.slice(lastSymbolIdx, i + 1).join(''));
      if (lastSymbol === undefined) {
        sum = num;
      } else {
        sum += (lastSymbol === '-' ? -1 : 1) * num;
      }
      lastSymbol = symbol;
      lastSymbolIdx = i + 1;
    }
  }
  if (lastSymbol === undefined) {
    // if there was no plus/minus at all, return all the numbers as a single
    // number.
    return Number(NUMBERS.join(''));
  } else {
    // the last number needs to be either added or subtracted.
    const num = Number(NUMBERS.slice(lastSymbolIdx).join(''));
    return sum + (lastSymbol === '-' ? -1 : 1) * num;
  }
}

const testCases = [
  {
    locations: Array.from({ length: 8 }, () => ''),
    expected: 987654321,
  },
  {
    locations: ['', '', '', '', '', '', '', '-'],
    expected: 98765432 - 1,
  },
  {
    locations: ['+', '', '', '', '', '', '', '-'],
    expected: 9 + 8765432 - 1,
  },
  {
    locations: ['+', '-', '', '', '', '', '', '-'],
    expected: 9 + 8 - 765432 - 1,
  },
  {
    locations: ['+', '-', '-', '', '', '+', '', '-'],
    expected: 9 + 8 - 7 - 654 + 32 - 1,
  },
] as { locations: PlusMinusEmpty[]; expected: number }[];

export function test() {
  for (const tcase of testCases) {
    const actual = getSum(tcase.locations);
    assert(
      tcase.expected === actual,
      `expected=${tcase.expected}; actual=${actual}`
    );
  }
  console.log('done testing!');
}

function replaceAt<T>(arr: T[], idx: number, val: T) {
  const ret = [...arr];
  ret[idx] = val;
  return ret;
}

function toEquation(locations: PlusMinusEmpty[]) {
  let output = NUMBERS[0] + '';
  for (let i = 0; i < locations.length; i++) {
    const symbol = locations[i];
    if (symbol === '') {
      output += NUMBERS[i + 1];
    } else {
      output += ` ${symbol} ${NUMBERS[i + 1]}`;
    }
  }
  return output;
}

export function run() {
  declareProblem('morning brew');
  // Change this number to try a different sum.
  const GOAL = 100;

  type HelperResponse = {
    locations: PlusMinusEmpty[];
    minusPlusCount: number;
    sum: number;
  };
  const toResponse = (locations: PlusMinusEmpty[], sum: number) => {
    return {
      sum,
      locations,
      minusPlusCount: locations.reduce(
        (tot, curr) => (curr === '+' || curr === '-' ? tot + 1 : tot),
        0
      ),
    };
  };

  let execution = 0;
  const helper = (locations: PlusMinusEmpty[], idx: number): HelperResponse => {
    const sum = getSum(locations);
    if (idx === locations.length) {
      return toResponse(locations, sum);
    } else if (sum === GOAL) {
      return toResponse(locations, sum);
    }
    execution++;
    const tries = [
      helper(locations, idx + 1), // No change to symbol. I.e., keep it empty ''.
      helper(replaceAt(locations, idx, '-'), idx + 1), // minus
      helper(replaceAt(locations, idx, '+'), idx + 1), // plus
    ].filter((t) => t.sum === GOAL);

    if (tries.length === 0) {
      // No solution; don't care about the sum, so just setting it to Infinity.
      // These will get filtered out anyways higher up the recursion tree.
      return toResponse(locations, Infinity);
    } else {
      // at least one solution. Take the one with the fewest number of
      // plus/minus
      let minTry = tries[0];
      for (let i = 1; i < tries.length; i++) {
        if (tries[i].minusPlusCount < minTry.minusPlusCount) {
          minTry = tries[i];
        }
      }
      return minTry;
    }
  };

  const ans = helper(
    Array.from({ length: 8 }, () => ''),
    0
  );
  console.log('done!', ans, toEquation(ans.locations), execution);
  return ans;
}
