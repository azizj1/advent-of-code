import { getSimulations, Simulation } from './7';
import { timer } from '~/util/Timer';

/**
 * If bag X contains A, B and C bags, then we'll add an edge from
 * X->A, X->B, X->C. This helps us with part B, where if C is 'shiny gold',
 * we can just figure out all the nodes that are reachable from C.
 */
export function toPartBSimulation({
  target,
  graph,
  name,
}: Simulation): Simulation {
  return {
    name,
    target,
    graph: graph.tranpose(),
  };
}

/**
 * From a given target, do a DFS search to all leaves to get sum of bags it all
 * contains.
 * So if bag X contains 4 A and 2 B, bag X contains at least 6 bags, plus however
 * many bags A can contain in itself and however many bags B can contain in
 * itself.
 */
function getTotalBagsFrom({ target, graph }: Simulation): number {
  if (graph.getAdjList(target).length === 0) {
    return 0;
  }
  const helper = (node: string, cache: Map<string, number>): number => {
    if (cache.has(node)) {
      return cache.get(node)!;
    }
    let totalBags = 0;
    for (const neighbor of graph.getAdjList(node)) {
      const weight = graph.getWeight(node, neighbor) ?? 1;
      totalBags += weight + weight * helper(neighbor, cache);
    }
    cache.set(node, totalBags);
    return totalBags;
  };
  return helper(target, new Map());
}

export function run() {
  const sims = getSimulations();
  const sim = sims[1];
  timer.run(getTotalBagsFrom, `day 7b - ${sim.name}`, toPartBSimulation(sim));
}
