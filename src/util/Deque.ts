export interface Deque<T> extends IterableIterator<T> {
  readonly size: number;
  offerFirst(data: T): void;
  offerLast(data: T): void;
  pollFirst(): T | undefined;
  pollLast(): T | undefined;
  peekFirst(): T | undefined;
  peekLast(): T | undefined;
  get(index: number): T | undefined;
  entries(): IterableIterator<[number, T]>;
}
