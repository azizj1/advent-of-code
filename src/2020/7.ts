import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import { WGraph } from '~/util/WeightedGraph';
import input from './7.txt';

export interface Simulation {
  name: string;
  target: string;
  graph: WGraph<string, number>;
}

/**
 * If bag X contains A, B and C bags, then we'll add an edge from
 * A->X, B->X, C->X. This helps us with part A, where if C is 'shiny gold',
 * we can just figure out all the nodes that are reachable from C.
 */
export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    target: sim.properties.get('target')![0],
    graph: sim.content.reduce((wg, line) => {
      const vertex = line.match(/^(.+)?(?: bags contain)/)?.[1];
      if (vertex) {
        if (line.includes('no other bags')) {
          wg.addVertex(vertex);
        } else {
          Array.from(line.matchAll(/(\d+) (.+?)(?: bag)/g))
            .map((bag) => ({
              count: Number(bag[1]),
              bag: bag[2],
            }))
            .forEach((b) => wg.addDirectedEdge(b.bag, vertex, b.count));
        }
      }
      return wg;
    }, new WGraph<string, number>()),
  }));
}

/**
 * Given a node 'target', find all the nodes that we can reach from target.
 */
function connectedNodesCount({ target, graph }: Simulation): number {
  if (graph.getAdjList(target).length === 0) {
    return 0;
  }
  const helper = (node: string, visited: Set<string>): number => {
    // We don't want double-count, so if node has already been accounted for,
    // give it a count of 0 now.
    if (visited.has(node)) {
      return 0;
    }
    visited.add(node);
    const adjList = graph.getAdjList(node);
    let count = 1;
    for (const neighbor of adjList) {
      count += helper(neighbor, visited);
    }
    return count;
  };
  // the node we start with is included in the count, so take that out by
  // subtracting 1.
  return helper(target, new Set()) - 1;
}

export function run() {
  const sims = getSimulations();
  const sim = sims[1];
  timer.run(connectedNodesCount, 'day 7a', sim);
}
