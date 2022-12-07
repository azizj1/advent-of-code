import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, last } from '~/util/util';
import input from './5.txt';

type Stack = string[];

interface Procedure {
  quantity: number;
  from: number; // 1-based index.
  to: number; // 1-based index.
}

interface Simulation {
  name: string;
  stacks: Stack[]; // 0-based index.
  procedures: Procedure[];
}

// Next time, just hard-code the stacks. It was not worth the time doing this
// programatically.
function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    // This line is the "1  2  3 .... 9"
    const stackLabelLineIdx = sim.content.findIndex((line) =>
      line.match(/^\s?(\d\s*)+/)
    );
    if (stackLabelLineIdx < 0) {
      console.log(sim.content);
      throw new Error('Couldnt find the numbers line.');
    }

    const stackLabelLine = sim.content[stackLabelLineIdx];
    const stackLocations = assert(
      Array.from(stackLabelLine.matchAll(/\d+/g)).map((label) => label.index!),
      (l) => l.length > 0
    );
    const stacks: Stack[] = [];
    // Add things to the stack horizontally, going down vertically line by line.
    // We only go down until the stackLabels
    for (let i = 0; i < stackLabelLineIdx; i++) {
      const line = sim.content[i];
      for (let j = 0; j < stackLocations.length; j++) {
        const loc = stackLocations[j];
        const crate = line[loc];
        // No crate for this stack
        if (!crate || crate === ' ') continue;

        stacks[j] ??= [];
        stacks[j].unshift(crate);
      }
    }

    // Build the procedures now!
    const procedures: Procedure[] = [];
    for (let i = stackLabelLineIdx + 1; i < sim.content.length; i++) {
      const line = sim.content[i];
      const match = line.match(/^move (\d+) from (\d+) to (\d+)/);
      if (!match || match.length !== 4) continue;

      const [, quantity, from, to] = match;
      procedures.push({
        quantity: Number(quantity),
        from: Number(from),
        to: Number(to),
      });
    }

    return {
      name: sim.name,
      stacks,
      procedures,
    };
  });
}

function runProcedures(sim: Simulation) {
  for (const procedure of sim.procedures) {
    for (let i = 0; i < procedure.quantity; i++) {
      const item = sim.stacks[procedure.from - 1].pop()!;
      sim.stacks[procedure.to - 1].push(item);
    }
  }
  return sim.stacks.map((s) => last(s)).join('');
}

function runProceduresMultiplePickup(sim: Simulation) {
  for (const procedure of sim.procedures) {
    const fromStack = sim.stacks[procedure.from - 1];
    const items = fromStack.splice(
      fromStack.length - procedure.quantity,
      procedure.quantity
    );
    sim.stacks[procedure.to - 1].push(...items);
  }
  return sim.stacks.map((s) => last(s)).join('');
}

export function run() {
  declareProblem('2022 day 5');
  let sims = getSimulations();
  for (const sim of sims) {
    timer.run(runProcedures, sim.name, sim);
  }
  declareProblem('2022 day 5b');
  sims = getSimulations();
  for (const sim of sims) {
    timer.run(runProceduresMultiplePickup, sim.name, sim);
  }
}
