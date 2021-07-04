import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './5.txt';
import { assert } from '~/util/assert';

type BoardingPassRow = 'F' | 'B';
type BoardingPassCol = 'L' | 'R';
type BoardingPass = BoardingPassRow | BoardingPassCol;

export interface Simulation {
  name: string;
  boardingPasses: BoardingPass[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((s) => ({
    name: s.name,
    boardingPasses: s.content as BoardingPass[],
  }));
}

function makeGetCloser(direction: 'row' | 'col') {
  // 2^6 = 128. Every time we make an adjustment, we decrease by a factor of 2
  // so that our adjustment goes from 64, then to 32, and eventually to 0.
  let atBit = direction === 'row' ? 7 : 3;
  return () => {
    atBit--;
    if (atBit < 0) {
      return 1;
    } else {
      // equivalent to 2^atBit
      return 1 << atBit;
    }
  };
}

export function toSeatId(boardingPass: string) {
  let minR = 0,
    maxR = 127,
    minC = 0,
    maxC = 7;
  const getRowCloser = makeGetCloser('row');
  const getColCloser = makeGetCloser('col');

  for (let i = 0; i < boardingPass.length; i++) {
    const char = boardingPass[i];
    switch (char) {
      case 'F':
        maxR -= getRowCloser();
        break;
      case 'B':
        minR += getRowCloser();
        break;
      case 'L':
        maxC -= getColCloser();
        break;
      case 'R':
        minC += getColCloser();
        break;
      default:
        throw new Error(`Unexpected character ${char}`);
    }
  }
  assert(minR === maxR, `${minR} !== ${maxR}`);
  assert(minC === maxC, `${minC} !== ${maxC}`);
  return minR * 8 + minC;
}

/**
 * We convert a pass like FBFBBFFRLR to a binary number,
 * where 'F' is 0, 'B' is 1 for the rows side. So 'FBFBBFF' becomes 0101100,
 * which is equal to 44. RLR is also just 101 = 5. To calculate seatId, we would
 * do 44 * 8 + 5 = 357, which is the same thing if we had treated the entire
 * pass as a single binary number: 0101100101 to get 357.
 */
export function toSeatId2(boardingPass: string) {
  let seatId = 0;

  for (let i = 0; i < boardingPass.length; i++) {
    // add a new bit to the right.
    seatId = seatId << 1;
    const char = boardingPass[i];

    // set the bit we just added to 1.
    if (char === 'R' || char === 'B') {
      seatId++;
    }
  }
  return seatId;
}

export function getMaxSeatId({ boardingPasses }: Simulation) {
  return boardingPasses
    .map(toSeatId2)
    .reduce((max, id) => Math.max(max, id), -Infinity);
}

export function run() {
  timer.run(getMaxSeatId, 'day 5a', getSimulations()[1]);
}
