import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniCommaSep, last } from '~/util/util';
import input from './15.txt';

interface Simulation {
  name: string;
  partOneAnswer?: number;
  gameNumbers: number[];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniCommaSep(input).map((sim) => ({
    name: sim.name,
    partOneAnswer: sim.properties.has('partOneAnswer')
      ? Number(sim.properties.get('partOneAnswer'))
      : undefined,
    gameNumbers: sim.content.map(Number),
  }));
}

function playGame({ gameNumbers }: Simulation, untilTurn: number) {
  assert(untilTurn > 0);
  if (untilTurn <= gameNumbers.length) {
    return gameNumbers[untilTurn - 1];
  }

  // maps spoken number to the turn it was spoken in.
  // don't add the last number yet, because we'll be playing with it.
  const spokenAlready = new Map(
    gameNumbers.slice(0, -1).map((g, i) => [g, i + 1])
  );
  let lastSpoken = last(gameNumbers);
  let lastTurn = gameNumbers.length;

  while (lastTurn < untilTurn) {
    if (spokenAlready.has(lastSpoken)) {
      const age = lastTurn - spokenAlready.get(lastSpoken)!;
      spokenAlready.set(lastSpoken, lastTurn);
      lastSpoken = age;
    } else {
      spokenAlready.set(lastSpoken, lastTurn);
      lastSpoken = 0;
    }
    lastTurn++;
  }
  return {
    turn: lastTurn,
    spoke: lastSpoken,
  };
}

export function run() {
  declareProblem('Day 15a');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(
      playGame,
      `day 15 - ${sim.name} - expected: ${sim.partOneAnswer} - ${sim.gameNumbers}`,
      sim,
      2020
    );
  }
  declareProblem('Day 15b');
  for (const sim of sims) {
    timer.run(
      playGame,
      `day 15 - ${sim.name} - expected: ${sim.partOneAnswer} - ${sim.gameNumbers}`,
      sim,
      30000000
    );
  }
}
