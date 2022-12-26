import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './21.txt';
import fs from 'fs';
import path from 'path';

type Operator = '+' | '-' | '*' | '/';
type Operation = [string, Operator, string];
type Equation = Operation | number;
function isNumber(eq: Equation): eq is number {
  return Number.isInteger(eq);
}

interface Simulation {
  name: string;
  // monkeyName to what it's doing
  equations: Map<string, Equation>;
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    const equations: { name: string; equation: Equation }[] = sim.content
      .map((line) => assert(line.split(': '), (a) => a.length === 2))
      .map(([name, eq]) => ({
        name,
        equation: (Number.isInteger(Number(eq))
          ? Number(eq)
          : (assert(
              eq.split(' '),
              (a) => a.length === 3
            ) as Operation)) as Equation,
      }));

    return {
      name: sim.name,
      equations: new Map(equations.map((e) => [e.name, e.equation])),
    };
  });
}

function buildSolver(equations: Map<string, Equation>) {
  // node to its final value
  const visited = new Map<string, number>();
  const helper = (node: string) => {
    if (visited.has(node)) return visited.get(node)!;

    const eq = equations.get(node)!;
    if (isNumber(eq)) return eq;

    const [operandKey1, operator, operandKey2] = eq;
    const operand1 = helper(operandKey1);
    const operand2 = helper(operandKey2);
    let ans = Infinity;
    switch (operator) {
      case '+':
        ans = operand1 + operand2;
        break;
      case '-':
        ans = operand1 - operand2;
        break;
      case '*':
        ans = operand1 * operand2;
        break;
      case '/':
        ans = operand1 / operand2;
        break;
      default:
        throw new Error('unhandled operator');
    }
    visited.set(node, ans);
    return ans;
  };
  return { solve: helper, values: visited };
}

function solve({ equations }: Simulation) {
  const solver = buildSolver(equations);
  return solver.solve('root');
}

function getRootOperatorsEqual({ equations }: Simulation) {
  const eq = equations.get('root')!;
  if (isNumber(eq)) throw new Error('idk');

  const key = 'humn';
  const [op1, , op2] = eq;
  // got this from initially doing it from [0, 1000], and then seeing what
  // relationship the output had to the input. It was evident that op2 never
  // changed, and op1 decreased by 100/3 (33.3333). Then it was just a matter of
  // setting humn equal to 0 to get A and B, and then solving
  //    A - 100x/3 = B   ->   x = (A-B)*3/100
  // That ended up being the answer!
  const approx = 3378273370680;
  const start = approx - 50;
  // key: input for humn; value: [op1 value, op2 value]
  const tester = new Map<number, [number, number]>();
  for (let i = 0; i <= 100; i++) {
    equations.set(key, start + i);
    const solver = buildSolver(equations);
    solver.solve('root');
    tester.set(i, [solver.values.get(op1)!, solver.values.get(op2)!]);
  }
  return tester;
}

function writeToCsv(tester: Map<number, [number, number]>) {
  const data = Array.from(tester.entries())
    .map((e) => e.flat().join(','))
    .join('\n');
  const output = path.join(__dirname, '21b-output.csv');
  fs.writeFile(output, data, 'utf8', (err) => {
    if (err) {
      console.log('failed to write', err);
    } else {
      console.log('done writing data to file!', output);
    }
  });
}

export function run() {
  declareProblem('2022 day 21');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(solve, sim.name, sim);
  }
  declareProblem('2022 day 21 part b');
  for (const sim of sims.slice(1)) {
    timer.run(pipe(getRootOperatorsEqual, writeToCsv), sim.name, sim);
  }
}
