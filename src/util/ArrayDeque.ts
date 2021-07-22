import { Deque } from './Deque';

export class ArrayDeque<T> implements Deque<T> {
  private readonly data: T[] = [];
  // head points to the actual head element
  private head = 0;
  // tail is leading, so it points to the next empty space.
  private tail = 0;

  constructor(initial: T[] = []) {
    for (const item of initial) {
      this.offerLast(item);
    }
  }

  /** @override */
  offerFirst(item: T) {
    this.head--;
    this.data[this.head] = item;
  }

  /** @override */
  offerLast(item: T) {
    this.data[this.tail] = item;
    this.tail++;
  }

  /** @override */
  pollFirst() {
    if (this.head === this.tail) {
      return undefined;
    }
    const polled = this.data[this.head];
    delete this.data[this.head];
    this.head++;

    return polled;
  }

  /** @override */
  pollLast() {
    if (this.head === this.tail) {
      return undefined;
    }
    this.tail--;
    const polled = this.data[this.tail];
    delete this.data[this.tail];

    return polled;
  }

  /** @override */
  peekFirst() {
    if (this.head === this.tail) {
      return undefined;
    }
    return this.data[this.head];
  }

  /** @override */
  peekLast() {
    if (this.head === this.tail) {
      return undefined;
    }
    return this.data[this.tail - 1];
  }

  /** @override */
  get size() {
    return this.tail - this.head;
  }

  /** @override */
  get(idx: number) {
    if (idx >= this.size || idx < 0) {
      return undefined;
    }
    return this.data[idx + this.head];
  }

  /** @override */
  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = this.head; i < this.tail; i++) {
      yield this.data[i];
    }
  }

  /** @override */
  *entries(): IterableIterator<[number, T]> {
    for (let i = this.head; i < this.tail; i++) {
      yield [i - this.head, this.data[i]];
    }
  }
}
