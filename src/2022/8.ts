import assert from 'assert';
import {
  declareProblem,
  declareSubproblem,
  getRunsFromIniNewlineSep,
} from '~/util/util';
import input from './8.txt';

interface Simulation {
  name: string;
  heights: number[][];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    heights: sim.content.map((s) => s.split('').map(Number)),
  }));
}

interface TreeInfo {
  x: number;
  y: number;
  height: number;
  // index 1 means "right" neighbor
  // index n means "down" neighbor
  // index -1 means "left" neighbor
  // index -n means "up" neighbor
  // Note: If my top neighbor is 4, but my height is 5, the topHeight will be my
  // height of 5.
  tallestHeights: number[];
}

function addTallestTrees(
  x: number,
  y: number,
  height: number,
  neighbors: Map<number, TreeInfo>,
  n: number
) {
  const inBound = makeInBound(n);
  const hash = makeHash(n);
  const treeInfo = neighbors.get(hash(x, y)) ?? {
    x,
    y,
    height,
    tallestHeights: [],
  };
  for (let i = 0, dir = [1, 0]; i < 4; i++, dir = rotate90cw(dir)) {
    const neighborPoint = { x: x + dir[0], y: y + dir[1] };
    const dirHash = hash(dir[0], dir[1]);
    if (treeInfo.tallestHeights[dirHash] != null) continue;
    if (!inBound(neighborPoint.x, neighborPoint.y)) {
      // If the neighbor in the direction I'm looking at doesn't exist, then
      // make the neighbors height -1, infeasibly low.
      treeInfo.tallestHeights[dirHash] = -1;
      continue;
    }
    const neighbor = neighbors.get(hash(neighborPoint.x, neighborPoint.y));
    // If I don't have a neighbor on the direction I'm looking for yet, then
    // move on.
    if (!neighbor) continue;

    // If I'm looking at the top neighbor, look at the top's neighbors top.
    const neighborSide = neighbor.tallestHeights[dirHash];
    if (neighborSide == null) continue;

    treeInfo.tallestHeights[dirHash] = Math.max(neighbor.height, neighborSide);
  }
  neighbors.set(hash(x, y), treeInfo);
}

function buildTallestTreeMap(sim: Simulation) {
  const n = sim.heights.length;
  const hash = makeHash(n);
  const inBound = makeInBound(n);
  const map = new Map<number, TreeInfo>(); // hash -> TreeInfo
  let dir = [1, 0]; // [x,y]

  // Start at (0,0), go to (n, 0) (all the way to the right), and then down
  // to (n, n), and then (0, n), and then finally (0, 1). We've fully gone
  // clockwise. And then go clockwise away until you're at the center.
  for (let x = 0, y = 0, i = 0; i < n * n; i++, x += dir[0], y += dir[1]) {
    addTallestTrees(x, y, sim.heights[y][x], map, n);
    const nx = x + dir[0];
    const ny = y + dir[1];
    if (!inBound(nx, ny) || map.has(hash(nx, ny))) {
      dir = rotate90cw(dir);
    }
  }

  // Now starting from the center, go counter-clockwise until you're back at
  // (0,0).
  const reverseDirection = Array.from(map.entries()).reverse();
  for (const [, treeInfo] of reverseDirection) {
    const { x, y, height } = treeInfo;
    addTallestTrees(x, y, height, map, n);
  }
  return map;
}

const makeInBound = (n: number) => (x: number, y: number) =>
  x >= 0 && x < n && y >= 0 && y < n;
const makeHash = (n: number) => (x: number, y: number) => x + y * n;

function rotate90cw(xy: number[]): [number, number] {
  assert(xy.length === 2, 'Only accepting 2d points');
  const [x, y] = xy;
  return [-y, x];
}

export function toString(map: Map<number, TreeInfo>, n: number) {
  const result: string[][] = [];
  const hash = makeHash(n);
  for (let i = 0; i < n; i++) {
    result[i] = [];
    for (let j = 0; j < n; j++) {
      const neighbors: number[] = [];
      const neighborInfo = map.get(hash(j, i))!;
      for (let k = 0, dir = [0, -1]; k < 4; k++, dir = rotate90cw(dir)) {
        neighbors.push(
          neighborInfo.tallestHeights[hash(dir[0], dir[1])] ?? '?'
        );
      }
      result[i][j] = neighbors.join(',');
    }
  }
  return result;
}

function countVisibleTrees(map: Map<number, TreeInfo>, n: number) {
  const hash = makeHash(n);
  let visibleTrees = (n - 1) * 4; // the edges
  // Iterate everything but the edges.
  for (let y = 1; y < n - 1; y++) {
    for (let x = 1; x < n - 1; x++) {
      const treeInfo = map.get(hash(x, y))!;
      for (let k = 0, dir = [1, 0]; k < 4; k++, dir = rotate90cw(dir)) {
        const neighborHeight = treeInfo.tallestHeights[hash(dir[0], dir[1])];
        if (treeInfo.height > neighborHeight) {
          visibleTrees++;
          break;
        }
      }
    }
  }
  return visibleTrees;
}

function getScenicScore(x: number, y: number, sim: Simulation) {
  const height = sim.heights[y][x];
  const n = sim.heights.length;
  const scenicScore = [];
  for (let i = 0, dir = [0, -1]; i < 4; i++, dir = rotate90cw(dir)) {
    let distance = 0;
    for (let j = 1; j < n; j++) {
      const nx = x + dir[0] * j,
        ny = y + dir[1] * j;
      const nextHeight = sim.heights[ny]?.[nx];
      // We've reached the end of the wall
      if (nextHeight == null) break;
      distance++;
      // We found the end of our view in this direction.
      if (nextHeight >= height) break;
    }
    scenicScore.push(distance);
  }
  return scenicScore;
}

function maxScenicScore(sim: Simulation) {
  let max = 0;
  const scenicScores = Array.from(
    { length: sim.heights.length },
    () => [] as string[]
  );
  const n = sim.heights.length;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const score = getScenicScore(x, y, sim);
      scenicScores[y][x] = score.join(',');
      max = Math.max(
        max,
        score.reduce((mult, curr) => mult * curr)
      );
    }
  }
  // console.log(scenicScores);
  return max;
}

export function run() {
  declareProblem('2022 day 8');
  const sims = getSimulations();
  for (const sim of sims) {
    declareSubproblem(sim.name);
    const map = buildTallestTreeMap(sim);
    // console.log(sim.heights);
    // console.log(toString(map, sim.heights.length));
    console.log(countVisibleTrees(map, sim.heights.length));
    console.log(maxScenicScore(sim));
  }
}
