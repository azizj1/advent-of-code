import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem } from '~/util/util';
import {
  Simulation,
  getSimulations,
  Rule,
  ExactRule,
  OrRule,
  AndRule,
} from './19';

const RULE_8 = '42 | 42 8';
const RULE_11 = '42 31 | 42 11 31';
const RULE_0 = '8 11';

/* Implementing rule 8 and 11 independently is difficult, because any of these
 * scenarios are valid:
 *   42 42 31
 *   42 42 42 31
 *   42 42 42 31 31
 *   42 42 42 42 31
 *   ...etc.
 *
 * Notice that 31 must be valid at least once, and at most 42ValidCount-1.
 *
 * If we try to build those two rules independently, rule 8 would just keep
 * running rule 42 until it no longer could, but rule 11 wouldn't know how many
 * 31s to expect.
 *
 * If we do them together though, we would just need to confirm 42 and 31 appear
 * at least once, and 31 is at most one fewer than the number of times 42
 * appears.
 */
class Rule0 implements Rule {
  constructor(private readonly rule42: Rule, private readonly rule31: Rule) {}

  isValid(msg: string, startAtIdx: number) {
    let rule42ValidCount = 0;
    let rule31ValidCount = 0;
    let nextStartAtIdx = startAtIdx;
    let res = this.rule42.isValid(msg, nextStartAtIdx);

    // get a count of how many times rule42 is valid.
    while (res.valid) {
      rule42ValidCount++;
      nextStartAtIdx = res.nextStartAtIdx;
      res = this.rule42.isValid(msg, nextStartAtIdx);
    }

    // now confirm that rule31 is valid for at most this many times.
    // rule42 count must be at least 1 greater.
    for (; rule31ValidCount < rule42ValidCount - 1; rule31ValidCount++) {
      res = this.rule31.isValid(msg, nextStartAtIdx);
      // if rule 31 is invalid for counts less than rule42ValidCount, we can
      // stop counting.
      if (!res.valid) {
        break;
      }
      nextStartAtIdx = res.nextStartAtIdx;
    }

    // both can't be zero, and rule42 must be at least 1 greater.
    if (rule42ValidCount === 0 || rule31ValidCount === 0) {
      return {
        valid: false,
        nextStartAtIdx: -1,
      };
    }
    return {
      valid: true,
      nextStartAtIdx,
    };
  }
}

function updateRules(rules: string[]) {
  rules[8] = RULE_8;
  rules[11] = RULE_11;
}

function buildRule(rules: string[]): Rule {
  const cache: { [rule: string]: Rule } = {};

  const helper = (rule: string): Rule => {
    if (cache[rule]) {
      return cache[rule];
    } else if (/^"[a-zA-Z]+"$/.test(rule)) {
      return (cache[rule] = new ExactRule(
        assert(rule.match(/^"(\w+)"$/)?.[1])
      ));
    } else if (rule === RULE_0) {
      return (cache[rule] = new Rule0(helper('42'), helper('31')));
    } else if (rule.includes('|')) {
      return (cache[rule] = new OrRule(rule.split(' | ').map(helper)));
    } else if (!isNaN(Number(rule))) {
      return (cache[rule] = helper(rules[Number(rule)]));
    } else if (/^\d+( \d+)+$/.test(rule)) {
      return (cache[rule] = new AndRule(rule.split(' ').map(helper)));
    } else {
      throw new Error(`Unknown rule ${rule}.`);
    }
  };

  return helper(rules[0]);
}

function validate({ rules, messages }: Simulation) {
  updateRules(rules);
  const rule = buildRule(rules);
  let validCount = 0;
  for (const msg of messages) {
    const response = rule.isValid(msg, 0);
    const valid = response.valid && response.nextStartAtIdx === msg.length;
    if (valid) {
      validCount++;
    }
  }
  return validCount;
}

export function run() {
  declareProblem('day 19b');
  const sim = getSimulations()[1];
  timer.run(validate, `day 19b - ${sim.name}`, sim);
}
