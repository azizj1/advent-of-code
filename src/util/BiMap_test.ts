import { assert } from '~/util/assert';
import { BiMap } from './BiMap';

export function test() {
  console.log('starting bimap tests...');
  let bimap = new BiMap<string, number>();
  bimap.set('a', 1);
  bimap.set('b', 2);
  bimap.set('c', 3);
  bimap.set('a', 4);
  console.log(Array.from(bimap.entries()));
  console.log(bimap.hasKey('a'));
  console.log(bimap.hasValue(4));
  console.log(bimap.getValue('a'));
  console.log(bimap.getKey(4));

  bimap.deleteByKey('a');
  console.log(Array.from(bimap.entries()));
  console.log(bimap.hasKey('a'));
  console.log(bimap.hasValue(4));

  bimap.deleteByValue(2);
  console.log(Array.from(bimap.entries()));

  testSize();
  console.log('bimap tests done.');

  bimap = new BiMap([['a', 1]]);
  console.log(Array.from(bimap.entries()));
  bimap = new BiMap(
    new Map([
      ['a', 1],
      ['b', 2],
    ])
  );
  console.log(Array.from(bimap.entries()));
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
  console.log(Array.from(bimap.entries()));

  bimap.deleteByValue(2);
  assert(bimap.size === 4);
  console.log(Array.from(bimap.entries()));

  bimap.deleteByKey('a');
  assert(bimap.size === 3);
  console.log(Array.from(bimap.entries()));

  bimap.set('d', 6); // already exists
  assert(bimap.size === 3);

  bimap.set('e', 5);
  bimap.set('e', 3);
  assert(bimap.size === 5);
  console.log(Array.from(bimap.entries()));

  bimap.deleteByKey('e');
  assert(bimap.size === 3);
  console.log(Array.from(bimap.entries()));

  console.log('done testing size');
}

test();
