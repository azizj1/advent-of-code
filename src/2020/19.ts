import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './19.txt';

export interface Simulation {
  name: string;
  rules: string[];
  messages: string[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    const rules: string[] = [];
    const messages: string[] = [];
    for (const line of sim.content) {
      if (/^\d+: /.test(line)) {
        const match = assert(line.match(/^(\d+): (.+)$/), (m) => m.length >= 3);
        const idx = assert(Number(match[1]), (n) => !isNaN(n));
        const rule = assert(match[2]);
        rules[idx] = rule;
      } else {
        messages.push(line);
      }
    }
    return {
      name: sim.name,
      rules,
      messages,
    };
  });
}

export interface Rule {
  isValid(msg: string, startAtIdx: number): RuleResponse;
}

export interface RuleResponse {
  valid: boolean;
  // When invalid, the field below is meaningless.
  // Otherwise, it indicates to which index in the message it evaluated the
  // rule. E.g., for AndRule, every rule in it uses the previous rule's
  // nextStartIdx.
  nextStartAtIdx: number;
}

export class AndRule implements Rule {
  constructor(private readonly rules: Rule[]) {}

  isValid(msg: string, startAtIdx: number) {
    let nextStartAtIdx = startAtIdx;

    for (const rule of this.rules) {
      const response = rule.isValid(msg, nextStartAtIdx);
      if (response.valid) {
        nextStartAtIdx = response.nextStartAtIdx;
      } else {
        return {
          valid: false,
          nextStartAtIdx,
        };
      }
    }

    return {
      valid: true,
      nextStartAtIdx,
    };
  }
}

export class OrRule implements Rule {
  constructor(private readonly rules: Rule[]) {}

  isValid(msg: string, startAtIdx: number) {
    const responses = this.rules.map((r) => r.isValid(msg, startAtIdx));
    const validResponses = responses.filter((res) => res.valid);
    if (validResponses.length > 0) {
      const nextStartAtIdx = validResponses[0].nextStartAtIdx;
      assert(
        validResponses.every((res) => res.nextStartAtIdx === nextStartAtIdx),
        `All valid rules in this OR rule don't have the same nextStartAtIdx: ${validResponses} for msg ${msg}.`
      );
      return {
        valid: true,
        nextStartAtIdx,
      };
    } else {
      return {
        valid: false,
        nextStartAtIdx: startAtIdx,
      };
    }
  }
}

export class ExactRule implements Rule {
  constructor(private readonly msg: string) {}

  isValid(msg: string, startAtIdx: number) {
    const size = this.msg.length;
    const nextStartAtIdx = startAtIdx + size;
    const valid = msg.slice(startAtIdx, nextStartAtIdx) === this.msg;
    return {
      valid,
      nextStartAtIdx,
    };
  }
}

export function buildRule(rules: string[]): Rule {
  const helper = (rule: string): Rule => {
    if (/^"[a-zA-Z]+"$/.test(rule)) {
      return new ExactRule(assert(rule.match(/^"(\w+)"$/)?.[1]));
    } else if (rule.includes('|')) {
      return new OrRule(rule.split(' | ').map(helper));
    } else if (!isNaN(Number(rule))) {
      return helper(rules[Number(rule)]);
    } else if (/^\d+( \d+)+$/.test(rule)) {
      return new AndRule(rule.split(' ').map(helper));
    } else {
      throw new Error(`Unknown rule ${rule}.`);
    }
  };

  return helper(rules[0]);
}

function validate({ rules, messages }: Simulation) {
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
  declareProblem('day 19a');
  const sim = getSimulations()[1];
  timer.run(validate, `day 19 - ${sim.name}`, sim);
}
