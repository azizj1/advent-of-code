import { assert } from '~/util/assert';

export class InfiniteGrid<T> {
  // for each dimension, store the min/max
  private dimensionBoundaries: { min: number; max: number }[];
  // each vector is represented as a comma-separted string.
  private readonly vectors = new Map<string, T>();

  constructor(private readonly dimensions: number) {
    this.dimensionBoundaries = Array.from({ length: dimensions }, () => ({
      min: 0,
      max: 0,
    }));
  }

  set(vector: number[], val: T): InfiniteGrid<T> {
    assert(vector.length === this.dimensions);
    this.vectors.set(this.toKey(vector), val);
    this.dimensionBoundaries = this.dimensionBoundaries.map(
      ({ min, max }, idx) => ({
        min: vector[idx] < min ? vector[idx] : min,
        max: vector[idx] > max ? vector[idx] : max,
      })
    );
    return this;
  }

  get(vector: number[]): T | undefined {
    return this.vectors.get(this.toKey(vector));
  }

  get boundaries() {
    return this.dimensionBoundaries.map((b) => ({ ...b }));
  }

  get size() {
    return this.vectors.size;
  }

  /**
   * @param entireGrid When set, it will traverse the entire grid within the
   * boundaries of the grid. So if the grid has [-4,1], [10, 5], [6, 7], it will
   * traverse the rectangle defined between y=1, y=7 and x=-4, x=10.
   * @param expandBy When `entireGrid` is provided, you have the option to
   * traverse outer in every dimension by the given `expandBy`.
   */
  *entries(
    entireGrid = false,
    expandBy = 0
  ): IterableIterator<[number[], T | undefined]> {
    if (entireGrid) {
      // eslint-disable-next-line
      const thisGrid = this;
      // see the non-generator version of this: src/util/getSpace().
      const startVector = this.boundaries.map((b) => b.min - expandBy);
      const endVector = this.boundaries.map((b) => b.max + expandBy);

      // eslint-disable-next-line
      function* helper(
        workingVector: number[]
      ): Generator<[number[], T | undefined]> {
        if (workingVector.length === startVector.length) {
          yield [[...workingVector], thisGrid.get(workingVector)];
        } else {
          const nextIdx = workingVector.length;
          const start = startVector[nextIdx];
          const end = endVector[nextIdx];
          for (let i = start; i <= end; i++) {
            workingVector.push(i);
            yield* helper(workingVector);
            workingVector.pop();
          }
          return;
        }
      }
      yield* helper([]);
    } else {
      for (const [key, val] of this.vectors.entries()) {
        yield [this.toVector(key), val];
      }
    }
  }

  private toKey(vector: number[]): string {
    return vector.join(',');
  }

  private toVector(key: string): number[] {
    return key.split(',').map(Number);
  }
}
