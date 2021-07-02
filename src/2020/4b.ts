import { timer } from '~/util/Timer';
import { getSimulations, Passport, Simulation } from './4';

interface Rule {
  isValid(passport: Passport): boolean;
}

class YearRule implements Rule {
  constructor(
    private readonly key: string,
    private readonly minYear: number,
    private readonly maxYear: number
  ) {}

  isValid(passport: Passport) {
    if (passport.has(this.key)) {
      const val = Number(passport.get(this.key)!);
      return !isNaN(val) && val >= this.minYear && val <= this.maxYear;
    }
    return false;
  }
}

class BirthYearRule extends YearRule {
  constructor() {
    super('byr', 1920, 2002);
  }
}

class IssueYearRule extends YearRule {
  constructor() {
    super('iyr', 2010, 2020);
  }
}

class ExpirationYearRule extends YearRule {
  constructor() {
    super('eyr', 2020, 2030);
  }
}

class HeightRule implements Rule {
  private readonly KEY = 'hgt';

  isValid(passport: Passport) {
    if (passport.has(this.KEY)) {
      const val = passport.get(this.KEY)!;
      const matches = val.match(/^(\d+)(cm|in)/) ?? [];
      const measurement = Number(matches[1]);
      const unit = matches[2];

      if (unit === 'cm' && measurement >= 150 && measurement <= 193) {
        return true;
      } else if (unit === 'in' && measurement >= 59 && measurement <= 76) {
        return true;
      }
      return false;
    }
    return false;
  }
}

class HairColorRule implements Rule {
  private readonly KEY = 'hcl';
  private readonly REGEX = /^#[0-9A-Fa-f]{6}$/;

  isValid(passport: Passport) {
    if (passport.has(this.KEY)) {
      return this.REGEX.test(passport.get(this.KEY)!);
    }
    return false;
  }
}

class EyeColorRule implements Rule {
  private readonly KEY = 'ecl';
  private readonly VALID_COLORS = new Set(['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth']);

  isValid(passport: Passport) {
    if (passport.has(this.KEY)) {
      return this.VALID_COLORS.has(passport.get(this.KEY)!);
    }
    return false;
  }
}

class PassportIdRule implements Rule {
  private readonly KEY = 'pid';
  private readonly REGEX = /^\d{9}$/;

  isValid(passport: Passport) {
    if (passport.has(this.KEY)) {
      return this.REGEX.test(passport.get(this.KEY)!);
    }
    return false;
  }
}

class AndRule implements Rule {
  constructor(private readonly rules: Rule[]) {}

  isValid(passport: Passport) {
    return this.rules.every((r) => r.isValid(passport));
  }
}

function and(...rules: Rule[]): Rule {
  return new AndRule(rules);
}

function buildRules() {
  return and(
    new BirthYearRule(),
    new IssueYearRule(),
    new ExpirationYearRule(),
    new HeightRule(),
    new HairColorRule(),
    new EyeColorRule(),
    new PassportIdRule()
  );
}

function getValidCount(rule: Rule) {
  return ({ passports }: Simulation) => passports.filter((p) => rule.isValid(p)).length;
}

export function run() {
  const rules = buildRules();
  const simulation = getSimulations()[0];
  timer.run(getValidCount(rules), 'day 4b', simulation);
}
