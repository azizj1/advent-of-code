import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './12.txt';

type Direction = 'N' | 'S' | 'E' | 'W';
type Action = Direction | 'L' | 'R' | 'F';

const dirVectors = new Map<Direction, [number, number]>([
  ['N', [0, 1]],
  ['S', [0, -1]],
  ['E', [1, 0]],
  ['W', [-1, 0]],
]);

interface Instruction {
  action: Action;
  value: number;
}

interface Simulation {
  name: string;
  instructions: Instruction[];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    instructions: sim.content.map((c) => ({
      action: c[0] as Action,
      value: Number(c.slice(1)),
    })),
  }));
}

function rotate(
  dir: 'R' | 'L',
  degrees: number,
  vector: [number, number]
): [number, number] {
  const rad = ((dir === 'R' ? -1 : 1) * degrees * Math.PI) / 180;
  const rotationMatrix = [
    [Math.cos(rad), -Math.sin(rad)],
    [Math.sin(rad), Math.cos(rad)],
  ];
  return [
    Math.round(
      vector.reduce((sum, curr, idx) => sum + curr * rotationMatrix[0][idx], 0)
    ),
    Math.round(
      vector.reduce((sum, curr, idx) => sum + curr * rotationMatrix[1][idx], 0)
    ),
  ];
}

function execute({ instructions }: Simulation): [number, number] {
  let location: [number, number] = [0, 0];
  let direction = dirVectors.get('E')!; // initial

  for (const { action, value } of instructions) {
    const [x, y] = location;
    if (dirVectors.has(action as Direction)) {
      const [dx, dy] = dirVectors.get(action as Direction)!;
      location = [x + dx * value, y + dy * value];
    } else if (action === 'F') {
      const [dx, dy] = direction;
      location = [x + dx * value, y + dy * value];
    } else if (action === 'R' || action === 'L') {
      direction = rotate(action, value, direction);
    }
  }

  return location;
}

function executeB({ instructions }: Simulation): [number, number] {
  let location: [number, number] = [0, 0];
  let direction: [number, number] = [10, 1]; // diff initial vector.

  for (const { action, value } of instructions) {
    const [x, y] = location;
    if (dirVectors.has(action as Direction)) {
      const [dx, dy] = dirVectors.get(action as Direction)!;
      // this is the only thing that's different between part A and B.
      // In part B, the direction changes. In part A, the ship's location
      // changes.
      direction = [direction[0] + dx * value, direction[1] + dy * value];
    } else if (action === 'F') {
      const [dx, dy] = direction;
      location = [x + dx * value, y + dy * value];
    } else if (action === 'R' || action === 'L') {
      direction = rotate(action, value, direction);
    }
  }

  return location;
}

function manhattanDistance(location: [number, number]) {
  return Math.abs(location[0]) + Math.abs(location[1]);
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(pipe(execute, manhattanDistance), `day 12 - ${sim.name}`, sim);
  timer.run(pipe(executeB, manhattanDistance), `day 12b - ${sim.name}`, sim);
}
