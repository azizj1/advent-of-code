import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { last } from '~/util/util';
import { Simulation, getSimulations, tokens, isOperator } from './18';

function solveAll({ mathExpressions }: Simulation) {
  return mathExpressions
    .map(toPostfix)
    .map(solve)
    .reduce((sum, curr) => sum + curr);
}

/**
 * It converts an expression like A * B + C + (D * E) to
 * ABC+*DE*+, and an expression like A * B * C * D to ABCD***.
 * Notice that the order of the numbers don't change at all. The rules are:
 */
function toPostfix(infixExpression: string): string[] {
  const output: string[] = [];
  const opStack: string[] = [];
  for (const word of tokens(infixExpression)) {
    if (!isNaN(Number(word))) {
      output.push(word);
    } else if (word === '+') {
      // this is the highest precedence operator, so you don't need to flush any
      // other operators out to the output.
      opStack.push(word);
    } else if (word === '*') {
      // Before putting this lower-precedence operator (*) into the operator
      // stack, take out any higher-precedence operator out (+) and put them
      // into the output stack. This is flushing.
      while (last(opStack) === '+') {
        output.push(opStack.pop()!);
      }
      // with the stack only consisting of '*' (or any plus signs that came
      // before opening parenthesis), push the '*' into the operator stack.
      opStack.push(word);
    } else if (word === '(') {
      // parenthesis go into the OPERATOR stack, since this will tell us when to
      // stop flushing operators when we encounter a closing parenthesis.
      opStack.push(word);
    } else if (word === ')') {
      // a closing parenthesis forces us to flush the operator stack until it
      // was opened.
      while (last(opStack) !== '(') {
        output.push(opStack.pop()!);
      }
      opStack.pop(); // remove the (
    } else {
      throw new Error(`Unknown word ${word}. Stack is ${output}.`);
    }
  }
  // If expression was A * B * C + D, output would equal "ABCD" and operator
  // stack would be ['*', '*', '+']. We need to flush all of those out to make
  // the output equal "ABCD+**".
  while (opStack.length > 0) {
    output.push(opStack.pop()!);
  }
  return output;
}

function solve(postfixExpression: string[]): number {
  const stack: number[] = [];
  for (const word of postfixExpression) {
    if (isOperator(word)) {
      const op1 = assert(stack.pop());
      const op2 = assert(stack.pop());
      stack.push(evaluate(op1, word, op2));
    } else {
      stack.push(assert(Number(word), (n) => !isNaN(n)));
    }
  }
  return assert(stack.pop(), stack.length === 0);
}

function evaluate(num1: number, operator: string, num2: number): number {
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
  timer.run(solveAll, `day 18b - ${sim.name}`, sim);
}
