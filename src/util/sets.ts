export function union<T>(...sets: Set<T>[]): Set<T> {
  const result = new Set<T>();
  for (const set of sets) {
    for (const item of set) {
      result.add(item);
    }
  }
  return result;
}

export function intersect<T>(...sets: Set<T>[]): Set<T> {
  if (sets.length < 2) {
    return sets[0];
  }
  // start from the smallest set first, so the nested loop is faster.
  const sortedSets = [...sets].sort((a, b) => a.size - b.size);
  // clone the smallest set and use that.
  const result = new Set([...sortedSets[0]]);
  for (let i = 1; i < sortedSets.length; i++) {
    // if the items in the result don't appear in sortedSets[i], remove it from
    // the result.
    for (const item of result) {
      if (!sortedSets[i].has(item)) {
        result.delete(item);
      }
    }
  }
  return result;
}

/**
 * Returns a set where each element is in A but not B.
 * Denoted as A-B or A\B.
 * Note that this is not a set XOR. E.g.,
 *    A = [1, 2, 3, 4]
 *    B = [3, 4, 5, 6]
 * Then, A - B = [1, 2]
 * But A ⊕ B =[1, 2, 5, 6]
 */
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const item of a) {
    if (!b.has(item)) {
      result.add(item);
    }
  }
  return result;
}

/**
 * Returns a set where each element is only in A or B, but not both.
 * E.g.,
 *    A = [1, 2, 3, 4]
 *    B = [3, 4, 5, 6]
 *    C = [6, 7, 8, 9]
 * Then, A ⊕ B =[1, 2, 5, 6].
 *    (A ⊕ B) ⊕ C = [1, 2, 5, 7, 8, 9]
 */
export function xor<T>(...sets: Set<T>[]): Set<T> {
  if (sets.length < 2) {
    return sets[0];
  }
  let result = new Set([...sets[0]]);
  for (let i = 1; i < sets.length; i++) {
    // A ⊕ B is defined as union(A, B) - intersect(A, B)
    result = difference(union(result, sets[i]), intersect(result, sets[i]));
  }
  return result;
}
