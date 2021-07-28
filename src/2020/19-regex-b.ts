import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, pipe } from '~/util/util';
import { getSimulations, Simulation } from './19';
import { RegexRule } from './19-regex';

const RULE_8 = '42 | 42 8';
const RULE_11 = '42 31 | 42 11 31';

function addRegex(sim: Simulation): RegexRule {
  const { rules } = sim;
  const cache: { [rule: string]: string } = {};

  const helper = (rule: string): string => {
    if (cache[rule]) {
      return cache[rule];
    } else if (rule === RULE_8) {
      return helper('42') + '+';
    } else if (rule === RULE_11) {
      // this is using regex subroutines, which isn't supported in Javascript
      // natively. You'll have to use PCRE flavor regex, whcih can be done via
      // @stephen-riley/pcre2-wasm.
      return `(?'rule11'${helper('42')}(?&rule11)?${helper('31')})`;
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
  declareProblem('day 19-regex-b');
  const sim = getSimulations()[0];
  timer.run(pipe(addRegex, validate), `day 19-regex-b - ${sim.name}`, sim);
}
