import assert from 'assert';
import { GenericSet } from '~/util/GenericSet';
import {
  declareProblem,
  declareSubproblem,
  getRunsFromIniNewlineSep,
} from '~/util/util';
import input from './9.txt';

interface Simulation {
  name: string;
  motions: [number, number][];
}

function dirToVector(str: string): [number, number] {
  switch (str) {
    case 'U':
      return [0, 1];
    case 'R':
      return [1, 0];
    case 'D':
      return [0, -1];
    case 'L':
      return [-1, 0];
    default:
      throw new Error(`Invalid direction ${str}.`);
  }
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    motions: sim.content
      .map((c) => c.split(' '))
      .map((motion) => ({
        dirVector: dirToVector(motion[0]),
        steps: Number(motion[1]),
      }))
      .map((m) => m.dirVector.map((c) => c * m.steps) as [number, number]),
  }));
}

class Vector {
  private readonly vector_: number[];
  readonly dimensions: number;

  constructor(vector: number[]) {
    this.vector_ = [...vector];
    this.dimensions = vector.length;
  }

  get vector() {
    return [...this.vector_];
  }

  translate(vector: number[] | Vector) {
    const otherVector = vector instanceof Vector ? vector.vector : vector;
    assert(otherVector.length === this.dimensions);
    for (let i = 0; i < this.dimensions; i++) {
      this.vector_[i] += otherVector[i];
    }
    return this;
  }

  /** this.vector - vector; */
  difference(vector: number[] | Vector) {
    const otherVector = vector instanceof Vector ? vector.vector : vector;
    assert(otherVector.length === this.dimensions);
    const result: number[] = [];
    for (let i = 0; i < this.dimensions; i++) {
      result[i] = this.vector_[i] - otherVector[i];
    }
    return new Vector(result);
  }

  abs() {
    const result: number[] = [];
    for (let i = 0; i < this.dimensions; i++) {
      result[i] = Math.abs(this.vector_[i]);
    }
    return new Vector(result);
  }

  complement() {
    return this.vector_.map((v) => -1 * v);
  }

  atOrigin() {
    return this.vector_.every((v) => v === 0);
  }

  clone() {
    return new Vector(this.vector_);
  }

  toString() {
    return '[' + this.vector_.join(',') + ']';
  }
}

function deltaBackoff(delta: Vector) {
  const [dx, dy] = delta.vector;
  // Assume delta is [1, -3] (maybe beacuse head = [4,7] and tail = [3,10]). If
  // we add [1,-3] to tail, then tail and head will be right on top of each
  // (head - tail = [0]). We really just want to take off [1, -2], so the tail
  // is right on top of the head.
  // If a delta's component is 1 in absolute terms, then we don't do any backing
  // off because we want to remove exactly 1 from the tail. If the component is
  // like 3, then we need to make it 2. If it's -3, we need to make it -2. We
  // need to add -1 for the 3, and +1 for -3. -1 * Math.sign(3) will give us
  // that.
  const backoff = (val: number) =>
    Math.abs(val) <= 1 ? 0 : -1 * Math.sign(val);
  return [backoff(dx), backoff(dy)];
}

function moveTowardsOrigin(v: Vector) {
  const [x, y] = v.vector;
  const backoff = (val: number) => (val === 0 ? 0 : -1 * Math.sign(val));
  const delta = new Vector([backoff(x), backoff(y)]);
  v.translate(delta);
  return delta.complement();
}

function getDelta(head: Vector, tail: Vector): Vector | undefined {
  // If we do delta + head, we'd get tail. So we need to have delta back off
  // by 1 so it's not on top.
  const delta = head.difference(tail);
  const [dx, dy] = delta.vector;
  if (dx === 0 && dy === 0) return undefined;
  if (Math.abs(dx) === 1 && Math.abs(dy) === 1) return undefined;
  // If the non-zero delta is 1, tail doesn't move.
  if ((dx === 0 || dy === 0) && (Math.abs(dx) === 1 || Math.abs(dy) == 1))
    return undefined;
  // Reduce delta a bit before we subtract it from tail.
  delta.translate(deltaBackoff(delta));
  return delta;
}

function simulateMotions(sim: Simulation) {
  const tailVisited = new GenericSet<number[]>(
    (nums) => nums.join(','),
    [[0, 0]]
  );
  const head = new Vector([0, 0]),
    tail = new Vector([0, 0]);
  for (const motion of sim.motions) {
    head.translate(motion);
    const delta = getDelta(head, tail);
    if (!delta) continue;
    // Since we want to know every single step the tail traveled, we can't just
    // do tail.translate(delta). We incrementally do tail.translate(delta). We
    // do that by taking off 1 step at a time from the delta, until delta is
    // [0,0].
    while (!delta.atOrigin()) {
      const oneStepCloser = moveTowardsOrigin(delta);
      tail.translate(oneStepCloser);
      tailVisited.add(tail.vector);
    }
    assert(
      head
        .difference(tail)
        .abs()
        .vector.reduce((sum, d) => sum + d) <= 2
    );
  }
  return {
    head,
    tail,
    tailVisited,
  };
}

function simulateMotionsMultipleTails(sim: Simulation, numOfTails: number) {
  // const lastTailVisisted = new GenericSet<number[]>(
  //   (nums) => nums.join(','),
  //   [[0, 0]]
  // );
  const knots = Array.from(
    { length: numOfTails + 1 },
    () => new Vector([0, 0])
  );
  for (const motion of sim.motions) {
    knots[0].translate(motion);

    for (let i = 0; i < knots.length - 1; i++) {
      const delta = getDelta(knots[i], knots[i + 1]);
      if (!delta) break;
      knots[i + 1].translate(delta);
      console.log(i, 'head', knots[i], 'tail', knots[i + 1]);
    }
  }

  return knots.map((k) => k.toString()).join(', ');
}

export function run() {
  declareProblem('2022 day 9');
  const sims = getSimulations().slice(0, 1);
  declareSubproblem('part a');
  for (const sim of sims) {
    const { head, tail, tailVisited } = simulateMotions(sim);
    console.log(head.toString(), tail.toString(), tailVisited.size);
  }
  for (const sim of sims) {
    declareSubproblem(`part b - ${sim.name}`);
    const res = simulateMotionsMultipleTails(sim, 9);
    console.log(res);
  }
}
