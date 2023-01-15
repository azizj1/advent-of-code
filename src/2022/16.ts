import { assert } from '~/util/assert';
import { combinations } from '~/util/math';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './16.txt';

interface Valve {
  name: string;
  flowRate: number;
  leadToValves: string[];
}

export interface Simulation {
  name: string;
  valves: Map<string, Valve>;
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    const valves = sim.content.map((line) => {
      const [, name, flowRate, leadToValves] = assert(
        line.match(/^Valve ([A-Z]+).+rate=(\d+);.+valves? (.+)$/),
        (matches) => matches.length === 4
      );
      return {
        name,
        flowRate: assert(Number(flowRate), (n) => !isNaN(n)),
        leadToValves: leadToValves.split(', '),
      };
    });
    return {
      name: sim.name,
      valves: new Map(valves.map((v) => [v.name, v])),
    };
  });
}

function findMaxPressureRelease({ valves }: Simulation) {
  const visited = new Map<string, { released: number; opened: Set<string> }>();
  const helper = (
    valveName: string,
    remainingTime: number,
    openedValve: Set<string>
  ): { released: number; opened: Set<string> } => {
    if (remainingTime <= 0) return { released: 0, opened: openedValve };

    const key =
      valveName +
      remainingTime.toString() +
      [...openedValve].sort((a, b) => a.localeCompare(b)).join(',');
    if (visited.has(key)) return visited.get(key)!;

    const valve = valves.get(valveName)!;
    let maxFlow = { released: -Infinity, opened: new Set<string>() };
    // Consider all subsequent valves.
    for (const nextValve of valve.leadToValves) {
      const options = [helper(nextValve, remainingTime - 1, openedValve)];
      if (valve.flowRate > 0 && !openedValve.has(valveName)) {
        const ans = helper(
          nextValve,
          remainingTime - 2,
          new Set(openedValve).add(valveName)
        );
        options.push({
          ...ans,
          released: ans.released + valve.flowRate * (remainingTime - 1),
        });
      }
      for (const option of options) {
        if (option.released > maxFlow.released) maxFlow = option;
      }
    }
    visited.set(key, maxFlow);
    return maxFlow;
  };
  const ans = helper('AA', 30, new Set(['AA']));
  return ans;
}

/**
 * This is a failed attempt at part 2. It doesn't work because the search space
 * is too large. I need to reduce it by using Floyd–Warshall Algorithm. See
 * 16b.ts.
 */
export function findMaxPressureRelease2({ valves }: Simulation) {
  const visited = new Map<string, number>();
  let cachehit = 0;

  const helper = (
    atValvesName: [string, string],
    remainingTime: number,
    openedValve: Set<string>
  ): number => {
    if (remainingTime <= 0) return 0;
    const key =
      [...atValvesName].sort((a, b) => a.localeCompare(b)).join(',') +
      remainingTime.toString() +
      [...openedValve].sort((a, b) => a.localeCompare(b)).join(',');
    if (visited.has(key)) {
      cachehit++;
      return visited.get(key)!;
    }

    // ['elephantValve', 'myValve'] to ->
    //    [{current: 'elephantValve', next: 'nextValve1}, {current: 'elephantValve', next: 'nextValve2'}]
    //    [{current: 'myValve', next: 'nextValve3}, {current: 'myValve', next: 'nextValve4'}]
    const atValves = atValvesName.map((name) =>
      valves
        .get(name)!
        .leadToValves.map((nextName) => ({ current: name, next: nextName }))
    );
    // [{current: 'elephantValve', next: 'nextValve1}, {current: 'elephantValve', next: 'nextValve2'}]
    // [{current: 'myValve', next: 'nextValve3}, {current: 'myValve', next: 'nextValve4'}]
    //    ->
    //    [{current: 'elephantValve', next: 'nextValve1}, {current: 'myValve', next: 'nextValve3}]
    //    [{current: 'elephantValve', next: 'nextValve1}, {current: 'myValve', next: 'nextValve4}]
    //    [{current: 'elephantValve', next: 'nextValve2}, {current: 'myValve', next: 'nextValve3}]
    //    [{current: 'elephantValve', next: 'nextValve2}, {current: 'myValve', next: 'nextValve4}]
    const combos = combinations(atValves);
    let maxFlow = -1;
    for (const [valve1, valve2] of combos) {
      const options = [maxFlow];
      const flow1 = valves.get(valve1.current)!.flowRate;
      const flow2 = valves.get(valve2.current)!.flowRate;
      const canOpen1 = flow1 > 0 && !openedValve.has(valve1.current);
      // Can't open both if they're both at the same location
      const canOpen2 =
        flow2 > 0 &&
        !openedValve.has(valve2.current) &&
        valve1.current !== valve2.current;

      // option 1: don't open either.
      options.push(
        helper([valve1.next, valve2.next], remainingTime - 1, openedValve)
      );
      // option 2: open 1 but not 2. valve1 stays put at current, but valve2
      // moves on.
      if (canOpen1) {
        options.push(
          helper(
            [valve1.current, valve2.next],
            remainingTime - 1,
            new Set(openedValve).add(valve1.current)
          ) +
            flow1 * (remainingTime - 1)
        );
      }
      // option 3: open 2 but not 1. valve1 moves on, valve2 stays put.
      if (canOpen2) {
        options.push(
          helper(
            [valve1.next, valve2.current],
            remainingTime - 1,
            new Set(openedValve).add(valve2.current)
          ) +
            flow2 * (remainingTime - 1)
        );
      }
      // option 4: open both. both advance, subtract 2 from time now.
      if (canOpen1 && canOpen2) {
        options.push(
          helper(
            [valve1.next, valve2.next],
            remainingTime - 2,
            new Set(openedValve).add(valve1.current).add(valve2.current)
          ) +
            flow1 * (remainingTime - 1) +
            flow2 * (remainingTime - 1)
        );
      }
      maxFlow = Math.max(...options);
    }
    visited.set(key, maxFlow);
    return maxFlow;
  };
  const done = helper(['AA', 'AA'], 26, new Set());
  console.log('cache hits', cachehit);
  return done;
}

export function run() {
  declareProblem('2022 day 16a');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(findMaxPressureRelease, sim.name, sim);
  }
}
