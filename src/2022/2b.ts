import { timer } from '~/util/Timer';
import { declareProblem } from '~/util/util';
import { getSimulations, SHAPE_OPPONENT, Simulation } from './2';

const SHAPE_YOU = {
  X: 0,
  Y: 3,
  Z: 6,
} as const;

type Shape = 'Rock' | 'Paper' | 'Scissors';

const RULES: { [shape: string]: { [against: number]: Shape } } = {
  Rock: {
    0: 'Scissors',
    6: 'Paper',
  },
  Paper: {
    0: 'Rock',
    6: 'Scissors',
  },
  Scissors: {
    0: 'Paper',
    6: 'Rock',
  },
} as const;

const SHAPE_VALUE = {
  Rock: 1,
  Paper: 2,
  Scissors: 3,
};

// @return If you need to lose, what to return.
function rps(a: Shape, b: number): Shape {
  if (b === 3) return a;
  return RULES[a][b];
}

function totalScore(sim: Simulation): number {
  let score = 0;
  for (const play of sim.strategyGuide) {
    const winLoss = SHAPE_YOU[play.you];
    const pickValue =
      SHAPE_VALUE[rps(SHAPE_OPPONENT[play.opponent].label, winLoss)];
    score += pickValue + winLoss;
  }
  return score;
}

export function run() {
  declareProblem('2022 2c');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(totalScore, sim.name, sim);
  }
}
