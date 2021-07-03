import { timer } from '~/util/Timer';
import { Simulation, getSimulations, toSeatId2, getMaxSeatId } from './5';

function getMissingSeat(sim: Simulation) {
  const { boardingPasses } = sim;
  const seatIds = new Set(boardingPasses.map(toSeatId2));
  const maxSeatId = getMaxSeatId(sim);

  for (let i = 1; i < maxSeatId; i++) {
    if (!seatIds.has(i) && seatIds.has(i - 1) && seatIds.has(i + 1)) {
      return i;
    }
  }
  return -1;
}

export function run() {
  timer.run(getMissingSeat, 'day 5b', getSimulations()[1]);
}
