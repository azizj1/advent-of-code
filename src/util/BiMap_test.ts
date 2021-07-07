import { assert } from '~/util/assert';
import { BiMap } from './BiMap';

export function test() {
  console.log('starting bimap tests...');
  const bimap = new BiMap<string, number>();
  bimap.set('a', 1);
  bimap.set('b', 2);
  bimap.set('c', 3);
  bimap.set('a', 4);
  console.log(bimap.entries());
  console.log(bimap.hasKey('a'));
  console.log(bimap.hasValue(4));
  console.log(bimap.getValue('a'));
  console.log(bimap.getKey(4));

  bimap.deleteByKey('a');
  console.log(bimap.entries());
  console.log(bimap.hasKey('a'));
  console.log(bimap.hasValue(4));

  bimap.deleteByValue(2);
  console.log(bimap.entries());

  testSize();
  console.log('bimap tests done.');
}

function testSize() {
  const bimap = new BiMap<string, number>();
  bimap.set('a', 1);
  bimap.set('a', 2);
  bimap.set('b', 2);
  bimap.set('b', 3);
  bimap.set('c', 5);
  bimap.set('d', 6);
  assert(bimap.size === 6);
  console.log(bimap.entries());

  bimap.deleteByValue(2);
  assert(bimap.size === 4);
  console.log(bimap.entries());

  bimap.deleteByKey('a');
  assert(bimap.size === 3);
  console.log(bimap.entries());

  bimap.set('d', 6); // already exists
  assert(bimap.size === 3);

  bimap.set('e', 5);
  bimap.set('e', 3);
  assert(bimap.size === 5);
  console.log(bimap.entries());

  bimap.deleteByKey('e');
  assert(bimap.size === 3);
  console.log(bimap.entries());

  console.log('done testing size');
}

test();
