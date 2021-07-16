import { timer } from '~/util/Timer';
import { declareProblem } from '~/util/util';
import { Simulation, getSimulations } from './13';

export function getEarliestTimestamp({ busSchedule }: Simulation) {
  const [maxNumId, maxNum] = busSchedule.reduce(
    (max, curr, idx) => (curr > max[1] ? [idx, curr] : max),
    [-1, 0]
  );

  // Say the max number is at index 4, and it's 97.
  // Say the first number is 13 (at index 0 obv).
  // Any timestamp we have must be divisible by 97, which allows us to use that
  // as our increment (see end of while loop) below.
  // We start our timestamp at maxNum - maxNumId (or 93) because we'll add idx
  // back to it in the if statement inside for-loop. So it'll be checking if 93
  // + 4 + 97x is divisible by 97 when it gets to 97, which must always be true.
  let timestamp = maxNum - maxNumId;
  while (timestamp < Number.MAX_SAFE_INTEGER) {
    let solutionFound = true;
    for (let i = 0; i < busSchedule.length; i++) {
      if (isNaN(busSchedule[i])) {
        continue;
      }
      if ((timestamp + i) % busSchedule[i] !== 0) {
        solutionFound = false;
        break;
      }
    }
    if (solutionFound) {
      break;
    }
    timestamp += maxNum;
  }
  return timestamp;
}

export function getEarliestTimestamp2({ busSchedule }: Simulation) {
  let timestamp = busSchedule[0];
  let step = busSchedule[0];

  for (let i = 1; i < busSchedule.length; i++) {
    if (isNaN(busSchedule[i])) {
      continue;
    }
    while ((timestamp + i) % busSchedule[i] !== 0) {
      timestamp += step;
    }
    // See markdown file for a breakdown of this solution.
    step = step * busSchedule[i];
  }
  return timestamp;
}

export function run() {
  declareProblem('day 13b');
  for (const sim of getSimulations()) {
    timer.run(getEarliestTimestamp2, `day 13b - ${sim.name}`, sim);
  }
}

export function test() {
  declareProblem('TEST');
  console.log(
    getEarliestTimestamp2({
      earliestDepature: NaN,
      name: 'test',
      busSchedule: [13, NaN, NaN, NaN, 97],
    })
  );
}
