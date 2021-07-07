import { timer } from '~/util/Timer';
import { runBootCode, getSimulations, Simulation, Instruction } from './8';

function toggleNopJmp(instructions: Instruction[], idx: number) {
  const instr = instructions[idx];
  if (instr.op === 'jmp') {
    instructions[idx].op = 'nop';
  } else if (instr.op === 'nop') {
    instructions[idx].op = 'jmp';
  }
}

function fixInfiniteLoop(
  { instructions }: Simulation,
  linesExecuted: number[]
) {
  for (let i = 0; i < linesExecuted.length; i++) {
    const instr = instructions[linesExecuted[i]];
    if (instr.arg === 0 || instr.op === 'acc') {
      continue;
    }
    toggleNopJmp(instructions, linesExecuted[i]);
    const response = runBootCode(instructions, { returnLinesExecuted: true });
    if (response.successful) {
      return response.accumulator;
    }
    toggleNopJmp(instructions, linesExecuted[i]);
  }
  throw new Error('Unable to break infinite loop.');
}

export function run() {
  const sim = getSimulations()[0];
  const { linesExecuted } = runBootCode(sim.instructions, {
    returnLinesExecuted: true,
  });
  timer.run(fixInfiniteLoop, 'day 8b', sim, linesExecuted!);
}
