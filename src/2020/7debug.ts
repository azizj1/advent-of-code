import { WGraph } from '~/util/WeightedGraph';
import { getSimulations } from './7';
import { toPartBSimulation } from './7b';

/**
 * Added this to debug my parser. I would compare
 * `sim` with `toPartBSimulation(toPartBSimulation(sim))`.
 */
export function equals(
  graph1: WGraph<string, number>,
  graph2: WGraph<string, number>
) {
  const vertices1 = new Set(graph1.vertices);
  const vertices2 = new Set(graph2.vertices);
  const vIntersection = intersect(vertices1, vertices2);
  if (vertices1.size !== vertices2.size) {
    console.log(
      `different # of vertices. v1 = ${vertices1.size}, v2 = ${vertices2.size}`
    );
  }
  if (
    vIntersection.size === vertices1.size &&
    vIntersection.size === vertices2.size
  ) {
    console.log('Both have the exact same verticies!');
  } else {
    console.log(
      'vertices1 has extra these:',
      [...vertices1].filter((v) => !vIntersection.has(v))
    );
    console.log(
      'vertices2 has extra these:',
      [...vertices2].filter((v) => !vIntersection.has(v))
    );
  }

  const edges1 = new Set(
    [...vertices1]
      .map((v) =>
        graph1.getAdjList(v).map((n) => `(${v},${n},${graph1.getWeight(v, n)})`)
      )
      .flat()
  );
  const edges2 = new Set(
    [...vertices2]
      .map((v) =>
        graph2.getAdjList(v).map((n) => `(${v},${n},${graph1.getWeight(v, n)})`)
      )
      .flat()
  );
  const eIntersection = intersect(edges1, edges2);
  if (
    eIntersection.size === edges1.size &&
    eIntersection.size === edges2.size
  ) {
    console.log('Both have the exact same edges!');
  } else {
    console.log(
      'edges1 has extra these:',
      [...edges1].filter((v) => !eIntersection.has(v))
    );
    console.log(
      'edges2 has extra these:',
      [...edges2].filter((v) => !eIntersection.has(v))
    );
  }
}

/** Assumes arr1 and arr2 only have unique values. */
function intersect(set1: Set<string>, set2: Set<string>) {
  return new Set([...set1].filter((s) => set2.has(s)));
}

export function run() {
  const sim = getSimulations()[1];
  equals(sim.graph, toPartBSimulation(toPartBSimulation(sim)).graph);
}
