import { assert } from '~/util/assert';
import { ArrayDeque } from './ArrayDeque';

export function test() {
  console.log('starting arraydeque tests...');
  const deque = new ArrayDeque<number>();
  deque.offerFirst(1);
  deque.offerFirst(2);
  const result = Array.from(deque);
  console.log(result);
  assert(result.length === 2);

  deque.offerLast(3);
  console.log(Array.from(deque));
  assert(deque.size === 3);

  deque.offerFirst(4);
  assert(deque.size === 4);
  testIterator(deque);
  testIterator(deque);
  console.log(deque);
  console.log(Array.from(deque));
  console.log(Array.from(deque.entries()));

  assert(deque.pollLast() === 3);
  assert(deque.size === 3);
  testIterator(deque);
  assert(deque.pollFirst() === 4);
  assert(deque.size === 2);
  console.log(Array.from(deque));
}

function testIterator(deque: ArrayDeque<number>) {
  let i = 0;
  for (const item of deque) {
    switch (i) {
      case 0:
        assert(item === 4);
        break;
      case 1:
        assert(item === 2);
        break;
      case 2:
        assert(item === 1);
        break;
      case 3:
        assert(item === 3);
        break;
      default:
        assert(false);
    }
    i++;
  }
}

test();
