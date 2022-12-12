import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { getRunsFromIniEmptyLineSep, pipe } from '~/util/util';
import input from './11.txt';

/*
 * This file does not work for part b. It was an attempt to see if moving things
 * to bigint would solve the problem, but it ends up not completing in < 5mins.
 */

interface Monkey {
  id: number;
  items: bigint[];
  operation: (old: bigint) => bigint;
  divisibleByTest: bigint;
  monkeyIdToThrowToIfTestPasses: number;
  monkeyIdToThrowToIfTestFails: number;
  itemsInspected: number;
}

interface Simulation {
  name: string;
  // monkeyId to Monkey.
  monkeys: Map<number, Monkey>;
}

function getSimulations(): Simulation[] {
  return getRunsFromIniEmptyLineSep(input).map((sim) => {
    const monkeys = sim.content.map<Monkey>((m) => {
      const id = assert(
        Number(m[0].match(/^Monkey (\d+):$/)![1]),
        (n) => !isNaN(n)
      );
      const [, itemsStr] = assert(m[1].split(': '), (r) => r.length === 2);
      const items = assert(itemsStr.split(', ').map(Number), (numbers) =>
        numbers.every((n) => !isNaN(n))
      ).map((n) => BigInt(n));
      const operation = new Function(
        'old',
        'return ' +
          assert(m[2].split(' = '), (r) => r.length === 2)[1].replace(
            /(\d+)/g,
            'BigInt($1)'
          )
      ) as (old: bigint) => bigint;
      const divisibleByTest = BigInt(
        assert(Number(m[3].match(/Test.+by (\d+)$/)![1]), (n) => !isNaN(n))
      );
      const monkeyIdToThrowToIfTestPasses = assert(
        Number(m[4].match(/If true.+monkey (\d+)$/)![1]),
        (n) => !isNaN(n)
      );
      const monkeyIdToThrowToIfTestFails = assert(
        Number(m[5].match(/If false.+monkey (\d+)$/)![1]),
        (n) => !isNaN(n)
      );
      return {
        id,
        items,
        operation,
        divisibleByTest,
        monkeyIdToThrowToIfTestPasses,
        monkeyIdToThrowToIfTestFails,
        itemsInspected: 0,
      };
    });
    return {
      name: sim.name,
      monkeys: new Map(monkeys.map((m) => [m.id, m])),
    };
  });
}

function runRounds(sim: Simulation, rounds: number, reduceWorryBy: bigint) {
  for (let i = 0; i < rounds; i++) {
    for (const monkey of sim.monkeys.values()) {
      for (const item of monkey.items) {
        const newWorryLevel = monkey.operation(item) / reduceWorryBy;
        // console.log('monkey', monkey.id, 'item', item, 'worry', newWorryLevel);
        const passesTest = newWorryLevel % monkey.divisibleByTest === 0n;
        if (passesTest) {
          sim.monkeys
            .get(monkey.monkeyIdToThrowToIfTestPasses)!
            .items.push(newWorryLevel);
        } else {
          sim.monkeys
            .get(monkey.monkeyIdToThrowToIfTestFails)!
            .items.push(newWorryLevel);
        }
        monkey.itemsInspected += monkey.items.length;
        monkey.items = [];
      }
    }
  }
}

function getActiveMonkeys(sim: Simulation, count: number) {
  return Array.from(sim.monkeys.values())
    .sort((a, b) => b.itemsInspected - a.itemsInspected)
    .slice(0, count)
    .map((m) => ({ id: m.id, inspected: m.itemsInspected }));
}

function getMonkeyBusiness(inspections: { inspected: number }[]) {
  return inspections.reduce((mult, curr) => mult * curr.inspected, 1);
}

export function run() {
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(() => {
      // Doesn't work for part 2 because it's super slow.
      runRounds(sim, 10_000, 1n);
      // console.log(sim.monkeys);
      console.log(pipe(getActiveMonkeys, getMonkeyBusiness)(sim, 2));
    }, sim.name);
  }
}
