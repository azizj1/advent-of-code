import { timer } from '~/util/Timer';
import input from './2.txt';
import { getRunsFromIniNewlineSep } from '~/util/util';

interface Simulation {
  name: string;
  passwords: PasswordRule[];
}

interface PasswordRule {
  min: number;
  max: number;
  letter: string;
  password: string;
}

function getSimulations() {
  return getRunsFromIniNewlineSep(input).map(({ name, content }) => ({
    name,
    passwords: content.map((lines) => {
      const [range, letter, password] = lines.split(' ');
      const [min, max] = range.split('-').map(Number);
      return {
        min,
        max,
        password,
        letter: letter[0],
      } as PasswordRule;
    }),
  }));
}

function isValid(rule: PasswordRule) {
  let count = 0;
  for (const letter of rule.password) {
    if (letter === rule.letter) {
      count++;
      if (count > rule.max) {
        return false;
      }
    }
  }
  return count >= rule.min;
}

function isValid2b({ password, letter, min, max }: PasswordRule) {
  // exactly one, so we use exclusive or (^).
  return (password[min - 1] === letter) ^ (password[max - 1] === letter);
}

function getValidCount(validator: (rule: PasswordRule) => boolean) {
  return (sim: Simulation) =>
    sim.passwords.reduce((agg, curr) => (validator(curr) ? agg + 1 : agg), 0);
}

export function run() {
  timer.run(getValidCount(isValid), 'day 2a', getSimulations()[0]);
  timer.run(getValidCount(isValid2b), 'day 2b', getSimulations()[0]);
}
