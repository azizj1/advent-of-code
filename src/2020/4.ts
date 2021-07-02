import { timer } from '~/util/Timer';
import { getRunsFromIniFile } from '~/util/util';
import input from './4.txt';

const REQUIRED = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid'];
// const OPTIONAL = ['cid'];

export type Passport = Map<string, string>;

export interface Simulation {
  name: string;
  passports: Passport[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniFile(input).map((sim) => ({
    name: sim.name,
    passports: sim.content
      .split(/\n\n/)
      .filter((p) => p.trim().length > 0)
      .map(
        (passport) =>
          new Map(
            Array.from(passport.matchAll(/([a-z]+):(#?[a-zA-Z0-9]+)/g)).map(([, key, val]) => [
              key,
              val,
            ])
          )
      ),
  }));
}

function isValid(passport: Passport) {
  for (const key of REQUIRED) {
    if (!passport.has(key)) {
      return false;
    }
  }
  return true;
}

function getValidCount({ passports }: Simulation) {
  return passports.filter(isValid).length;
}

export function run() {
  timer.run(getValidCount, 'day 4a', getSimulations()[0]);
}
