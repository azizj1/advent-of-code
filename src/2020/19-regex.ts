import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, pipe } from '~/util/util';
import { getSimulations, Simulation } from './19';

export interface RegexRule extends Simulation {
  regex: string;
}

function addRegex(sim: Simulation): RegexRule {
  const { rules } = sim;
  const cache: { [rule: string]: string } = {};

  const helper = (rule: string): string => {
    if (cache[rule]) {
      return cache[rule];
    } else if (/^"[a-zA-Z]+"$/.test(rule)) {
      return (cache[rule] = assert(rule.match(/^"(\w+)"$/)?.[1]));
    } else if (!isNaN(Number(rule))) {
      return (cache[rule] = helper(rules[Number(rule)]));
    } else if (rule.includes('|')) {
      return (cache[rule] =
        '(' + rule.split(' | ').map(helper).join('|') + ')');
    } else if (/^\d+( \d+)+$/.test(rule)) {
      return (cache[rule] = rule.split(' ').map(helper).join(''));
    } else {
      throw new Error(`Unknown rule ${rule}.`);
    }
  };
  return { ...sim, regex: helper(rules[0]) };
}

function validate({ regex, messages }: RegexRule) {
  const regexBoundaries = new RegExp(`^${regex}$`);
  let validCount = 0;
  for (const msg of messages) {
    if (regexBoundaries.test(msg)) {
      validCount++;
    }
  }
  return validCount;
}

export function run() {
  declareProblem('day 19-regex');
  const sim = getSimulations()[1];
  timer.run(pipe(addRegex, validate), `day 19-regex - ${sim.name}`, sim);
}
