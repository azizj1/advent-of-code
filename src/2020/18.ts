import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep, last } from '~/util/util';
import input from './18.txt';

export interface Simulation {
  name: string;
  mathExpressions: string[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    mathExpressions: sim.content,
  }));
}

function solveAll({ mathExpressions }: Simulation) {
  return mathExpressions.map(solve).reduce((sum, curr) => curr + sum);
}

function solve(expression: string) {
  const stack: string[] = [];
  for (const word of tokens(expression)) {
    stack.push(word);
    while (stack.length >= 2) {
      const popped = stack.pop()!;
      // if the current word is a number and the last thing was an operator,
      // take out the operator and the number before it, evaluate it, and put
      // the evaluated word back in.
      if (!isNaN(Number(popped)) && isOperator(last(stack))) {
        const op = stack.pop()!;
        const operand = stack.pop()!;
        stack.push(evaluate(popped, op, operand).toString());
      } else if (popped === ')') {
        // Something like (4 + 5) would've been converted into (9) before the
        // ')' was encountered, so we just take out the 9 outside of the
        // parenthesis. I.e., make "(9)" into "9".
        const resolvedNum = stack.pop()!;
        stack.pop()!; // opening parenthesis
        stack.push(resolvedNum);
      } else {
        // may be the first number, or an opening parenthesis, or an operator,
        // etc. Just push those back in and evaluate those later.
        stack.push(popped);
        break;
      }
    }
  }
  return assert(Number(stack.pop()), (n) => !isNaN(n) && stack.length === 0);
}

/**
 * It returns the next parenthesis, or operator, or number. E.g.,
 * an expression of "4 + (23 * 3)" would return "4", "+", "(", "23", "*", "3",
 * ")".
 */
export function* tokens(expression: string): Generator<string> {
  assert(expression, expression.length > 0);
  let remaining = expression;
  while (remaining.length > 0) {
    if (isParenthesis(remaining[0])) {
      const parenthesis = remaining[0];
      remaining = remaining.slice(1).trim();
      yield parenthesis;
    } else {
      let word = '';
      let i = 0;
      for (; i < remaining.length && remaining[i] !== ' '; i++) {
        const letter = remaining[i];
        if (isParenthesis(letter)) {
          break;
        }
        word += letter;
      }
      remaining = remaining.slice(i).trim();
      yield word;
    }
  }
}

export function isOperator(word: string): boolean {
  return word === '*' || word === '+';
}

function isParenthesis(word: string): boolean {
  return word === '(' || word === ')';
}

function evaluate(numStr1: string, operator: string, numStr2: string): number {
  const num1 = assert(Number(numStr1), (n) => !isNaN(n));
  const num2 = assert(Number(numStr2), (n) => !isNaN(n));

  switch (operator) {
    case '+':
      return num1 + num2;
    case '*':
      return num1 * num2;
    default:
      throw new Error(`Invalid operator ${operator}.`);
  }
}

export function run() {
  const sim = getSimulations()[4];
  timer.run(solveAll, `day 18 - ${sim.name}`, sim);
}
