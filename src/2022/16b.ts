import { timer } from '~/util/Timer';
import { declareProblem, pipe } from '~/util/util';
import { getSimulations, Simulation } from './16';

interface AdjacencyMatrix {
  [fromValve: string]: { [toValve: string]: number };
}

interface AdjSim {
  adj: AdjacencyMatrix;
  sim: Simulation;
}

function getAdjacencyMatrix(sim: Simulation) {
  const { valves } = sim;
  const response: AdjacencyMatrix = {};
  const allValves = new Set<string>();
  for (const [name, valve] of valves) {
    response[name] = { [name]: 0 };
    allValves.add(name);
    for (const toValve of valve.leadToValves) {
      response[name][toValve] = 1;
      allValves.add(toValve);
    }
  }
  for (const i of allValves) {
    for (const j of allValves) {
      response[i] ??= {};
      response[i][j] ??= Infinity;
    }
  }
  for (const k of allValves) {
    for (const i of allValves) {
      for (const j of allValves) {
        response[i][j] = Math.min(
          response[i][j],
          response[i][k] + response[k][j]
        );
      }
    }
  }
  return { adj: response, sim };
}

function pruneZeroFlow(params: AdjSim) {
  const ignore = 'AA';
  const {
    adj,
    sim: { valves },
  } = params;
  const removed = new Set<string>();
  for (const valve of Object.keys(adj)) {
    if (valves.get(valve)!.flowRate === 0 && valve !== ignore) {
      delete adj[valve];
      removed.add(valve);
    }
  }
  for (const i of Object.keys(adj)) {
    for (const j of Object.keys(adj[i])) {
      if (removed.has(j)) delete adj[i][j];
    }
  }
  return params;
}

export function print({ adj, sim }: AdjSim) {
  let str =
    '   ' +
    Object.keys(adj)
      .map((k) => k)
      .join(' ') +
    '\n';
  for (const i of Object.keys(adj)) {
    str += i + ' ';
    str += Object.keys(adj)
      .map((j) => adj[i][j].toString().padStart(2, ' '))
      .join(' ');
    str += '\n';
  }
  console.log(str);
  return { adj, sim };
}

export function findMaxPressureRelease(params: AdjSim) {
  const visited = new Map<string, number>();
  const {
    adj,
    sim: { valves },
  } = params;
  const helper = (
    atValve: string,
    remainingTime: number,
    openedValve: Set<string>
  ): number => {
    if (remainingTime <= 0) return 0;

    const key =
      atValve +
      remainingTime.toString() +
      [...openedValve].sort((a, b) => a.localeCompare(b)).join(',');
    if (visited.has(key)) return visited.get(key)!;

    let max = 0;
    for (const toValve of Object.keys(adj[atValve])) {
      if (openedValve.has(toValve)) continue;
      const newRemaining = remainingTime - adj[atValve][toValve] - 1;
      const flow = valves.get(toValve)!.flowRate;
      max = Math.max(
        max,
        helper(toValve, newRemaining, openedValve.add(toValve)) +
          flow * newRemaining
      );
      openedValve.delete(toValve);
    }
    visited.set(key, max);
    return max;
  };
  const ans = helper('AA', 30, new Set(['AA']));
  return ans;
}

export function findMaxPressureRelease2(params: AdjSim) {
  const {
    adj,
    sim: { valves },
  } = params;
  const visited = new Map<string, number>();

  const helper = (
    atValve: string,
    remainingTime: number,
    openedValve: Set<string>,
    runAgain: boolean
  ): number => {
    if (remainingTime <= 0) return 0;

    const key =
      atValve +
      remainingTime.toString() +
      [...openedValve].sort((a, b) => a.localeCompare(b)).join(',') +
      runAgain;
    if (visited.has(key)) return visited.get(key)!;

    let max = 0;
    // Figure out YOUR max pressure release.
    for (const toValve of Object.keys(adj[atValve])) {
      if (openedValve.has(toValve)) continue;

      const newRemaining = remainingTime - adj[atValve][toValve] - 1;
      if (newRemaining <= 0) continue;

      openedValve.add(toValve);
      const flow = valves.get(toValve)!.flowRate;
      const yourReleasedPressure =
        helper(toValve, newRemaining, openedValve, runAgain) +
        flow * newRemaining;
      openedValve.delete(toValve);

      max = Math.max(max, yourReleasedPressure);
    }
    // Figure out the elephant's released pressure.
    const elephantReleasedPressure = runAgain
      ? helper('AA', 26, openedValve, false)
      : 0;
    // Whoever (you or the elephant) does it best at this depth in the DFS wins
    // the max.
    max = Math.max(max, elephantReleasedPressure);
    visited.set(key, max);
    return max;
  };
  const ans = helper('AA', 26, new Set(['AA']), true);
  return ans;
}

export function run() {
  declareProblem('2022 day 16 - ADJ MATRIX - part a');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(
      pipe(
        getAdjacencyMatrix,
        // print,
        pruneZeroFlow,
        print,
        findMaxPressureRelease2
      ),
      sim.name,
      sim
    );
  }
}
