import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './8.txt';

export interface Instruction {
  op: 'nop' | 'jmp' | 'acc';
  arg: number;
}

export interface Simulation {
  name: string;
  instructions: Instruction[];
}

export interface Response {
  accumulator: number;
  successful: boolean;
  linesExecuted?: number[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    instructions: sim.content.map((line) => {
      const [op, arg] = line.split(' ');
      return {
        op,
        arg: Number(arg),
      } as Instruction;
    }),
  }));
}

interface RunOptions {
  returnLinesExecuted?: boolean;
}

export function runBootCode(
  instructions: Instruction[],
  options: RunOptions = {}
): Response {
  const visitedLines = new Set<number>();
  let accumulator = 0,
    idx = 0;

  while (!visitedLines.has(idx) && idx >= 0 && idx < instructions.length) {
    visitedLines.add(idx);
    const instr = instructions[idx];
    switch (instr.op) {
      case 'nop':
        idx++;
        break;
      case 'acc':
        idx++;
        accumulator += instr.arg;
        break;
      case 'jmp':
        idx += instr.arg;
        break;
      default:
        throw new Error(`Unexpected operation ${instr.op} on line ${idx}`);
    }
  }
  return {
    accumulator,
    successful: idx >= instructions.length,
    ...(options.returnLinesExecuted
      ? { linesExecuted: [...visitedLines] }
      : {}),
  };
}

export function run() {
  const sim = getSimulations()[0];
  timer.run(runBootCode, `day 8a - ${sim.name}`, sim.instructions);
}
