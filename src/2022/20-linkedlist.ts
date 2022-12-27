import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './20.txt';

export interface Simulation {
  name: string;
  file: number[];
  // indices of the numbers. This isn't valuable for parta
  // but it comes important for partb
  // It'll store the location of file values. E.g., indices[4] = 10 means that
  // the 10th number in the file is located at location 4.
  indices: number[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    file: assert(sim.content.map(Number), (arr) => arr.every((n) => !isNaN(n))),
    indices: Array.from({ length: sim.content.length }, (_, i) => i),
  }));
}

class Node<T> {
  constructor(public val: T, public next?: Node<T>, public prev?: Node<T>) {}
}
type IndexPair<V> = { idx: number; val: V };

/**
 * This solution doesn't end up working for my input. 2022/20.ts works though.
 */
export class DCircularLinkedList implements Iterable<IndexPair<number>> {
  // maps index to node
  private readonly map = new Map<number, Node<IndexPair<number>>>();
  private readonly head = new Node({ idx: -1, val: Infinity });

  constructor() {
    this.head.prev = this.head;
    this.head.next = this.head;
  }

  get size() {
    return this.map.size;
  }

  get(idx: number) {
    return this.map.get(idx);
  }

  offerLast(val: number) {
    const idx = this.size;
    const node = new Node({ idx, val }, this.head, this.head.prev);
    this.map.set(idx, node);
    // When there is no item, this.head.prev points to this.head, so we end up
    // changing this.head.next to the new node.
    this.head.prev!.next = node;
    this.head.prev = node;
  }

  move(idx: number, steps: number) {
    if (steps === 0) return;
    if (!this.map.has(idx)) return;

    const removeNode = (node: Node<unknown>) => {
      node.prev!.next = node.next;
      node.next!.prev = node.prev;
    };
    const getnext =
      steps > 0
        ? <T>(curr: Node<T>) => curr.next
        : <T>(curr: Node<T>) => curr.prev?.prev;

    steps = Math.abs(steps) % this.size;
    const node = this.map.get(idx)!;
    while (steps-- > 0) {
      const next = getnext(node);
      removeNode(node);
      // add it in front of next
      node.next = next?.next;
      node.prev = next;
      next!.next!.prev = node;
      next!.next = node;
      if (next === this.head) steps++;
    }
  }

  getNext(idx: number) {
    const node = this.map.get(idx);
    if (!node) return undefined;

    return node.next === this.head ? node.next?.next : node.next;
  }

  /** @implements */
  *[Symbol.iterator](): IterableIterator<IndexPair<number>> {
    let node = this.head.next;
    while (node !== undefined && node !== this.head) {
      yield node.val;
      node = node.next;
    }
  }

  *orderAdded(): IterableIterator<IndexPair<number>> {
    for (const node of this.map.values()) {
      yield node.val;
    }
  }
}

function mix({ file }: Simulation) {
  const list = new DCircularLinkedList();
  for (const line of file) {
    list.offerLast(line);
  }
  for (const node of list.orderAdded()) {
    list.move(node.idx, node.val);
  }
  return list;
}

function groveCoordinates(list: DCircularLinkedList) {
  const zeroIdx = assert(
    Array.from(list).filter((item) => item.val === 0),
    (arr) => arr.length === 1
  )[0].idx;
  console.log('zeroidx', zeroIdx);
  return [1000, 2000, 3000]
    .map((n) => {
      n = n % list.size;
      let idx = zeroIdx;
      let node = list.get(idx);
      while (n-- > 0) {
        node = list.getNext(idx);
        idx = node!.val.idx;
      }
      console.log(node!.val);
      return node!.val.val;
    })
    .reduce((sum, curr) => sum + curr);
}

export function run() {
  const sims = getSimulations();
  declareProblem('2022 day 20');
  for (const sim of sims) {
    timer.run(pipe(mix, groveCoordinates), sim.name, sim);
  }
}

export function test() {
  declareProblem('test');
  const list = new DCircularLinkedList();
  const vals = Array.from({ length: 10 }, (_, i) => i * 10);
  for (const v of vals) {
    list.offerLast(v);
  }
  const initial = Array.from(list);
  list.move(3, 1);
  list.move(3, -1);
  equals(initial, Array.from(list), 'move by +/- 1');
  list.move(3, 8);
  list.move(3, -8);
  equals(initial, Array.from(list), 'move by +/- 8');
  list.move(list.size - 1, 1);
  list.move(list.size - 1, -1);
  equals(initial, Array.from(list));
  list.move(1, -3);
  list.move(1, 3);
  equals(initial, Array.from(list));
}

export function equals(
  a: IndexPair<number>[],
  b: IndexPair<number>[],
  header = ''
) {
  assert(a.length === b.length, 'Not same size');
  for (let i = 0; i < a.length; i++) {
    assert(
      a[i].val === b[i].val,
      `${header}: val are different @ i=${i}; a[i]=${a[i].val}, b[i]=${b[i].val}`
    );
    assert(a[i].idx === b[i].idx, 'idx are different');
  }
}
