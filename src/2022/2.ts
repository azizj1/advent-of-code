import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './2.txt';

export const SHAPE_OPPONENT = {
  A: {
    label: 'Rock',
    value: 1,
  },
  B: {
    label: 'Paper',
    value: 2,
  },
  C: {
    label: 'Scissors',
    value: 3,
  },
} as const;

// paper > rock
// rock > scissors
// scissors > paper

const SHAPE_YOU = {
  X: SHAPE_OPPONENT.A,
  Y: SHAPE_OPPONENT.B,
  Z: SHAPE_OPPONENT.C,
} as const;

export type Shape = 'Rock' | 'Paper' | 'Scissors';
export type Opponent = keyof typeof SHAPE_OPPONENT;
export type You = keyof typeof SHAPE_YOU;

export interface Simulation {
  name: string;
  strategyGuide: { opponent: Opponent; you: You }[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    strategyGuide: sim.content
      .map((line) => line.split(' ') as [Opponent, You])
      .map(([opponent, you]) => ({ opponent, you })),
  }));
}

const RULES: { [shape: string]: { [against: string]: 0 | 6 } } = {
  Rock: {
    Paper: 0,
    Scissors: 6,
  },
  Paper: {
    Scissors: 0,
    Rock: 6,
  },
  Scissors: {
    Rock: 0,
    Paper: 6,
  },
} as const;

// @return 0 if a loses, 3 if draw, 6 if a wins.
function rps(a: Shape, b: Shape): 0 | 3 | 6 {
  if (a === b) return 3;
  return RULES[a][b];
}

function totalScore(sim: Simulation): number {
  let score = 0;
  for (const play of sim.strategyGuide) {
    const pickValue = SHAPE_YOU[play.you].value as number;
    const winLoss = rps(
      SHAPE_YOU[play.you].label,
      SHAPE_OPPONENT[play.opponent].label
    );
    score += pickValue + winLoss;
  }
  return score;
}

export function run() {
  declareProblem('2022 2a');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(totalScore, sim.name, sim);
  }
}
