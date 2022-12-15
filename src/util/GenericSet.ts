export type HashFunction<E> = (e: E) => string | number;

export class GenericSet<E> extends Set<E | string | number> {
  protected getHash: HashFunction<E>;
  private valuesMap = new Map<E | string | number, E>();

  /* eslint-disable no-dupe-class-members */
  constructor(toClone: GenericSet<E>);
  constructor(getHash: HashFunction<E>);
  constructor(getHash: HashFunction<E>, data: E[] | IterableIterator<E>);
  constructor(
    setOrHash: GenericSet<E> | HashFunction<E>,
    data?: E[] | IterableIterator<E>
  ) {
    super();
    if (typeof setOrHash === 'function') {
      this.getHash = setOrHash;
      for (const d of data ?? []) this.add(d);
    } else {
      this.getHash = setOrHash.getHash;
      for (const d of setOrHash) super.add(d);
    }
  }
  /* eslint-enable no-dupe-class-members */

  override add(e: E) {
    const hash = this.getHash(e);
    super.add(hash);
    this.valuesMap.set(hash, e);
    return this;
  }

  override delete(e: E) {
    const hash = this.getHash(e);
    const deleted = super.delete(hash);
    this.valuesMap.delete(hash);
    return deleted;
  }

  override has(e: E) {
    return super.has(this.getHash(e));
  }

  hasHash(h: string | number) {
    return super.has(h);
  }

  equals(other: GenericSet<E>) {
    if (this.size !== other.size) return false;
    for (const item of other.values()) if (!super.has(item)) return false;
    return true;
  }

  subsetOf(
    parent: GenericSet<E>,
    hashMapperOnSubset?: (i: string | number) => string | number
  ) {
    if (hashMapperOnSubset == null) hashMapperOnSubset = (i) => i;
    for (const item of this.values())
      if (
        !parent.hasHash(
          hashMapperOnSubset(item as string | number) as string | number
        )
      )
        return false;
    return true;
  }

  override *[Symbol.iterator](): IterableIterator<E> {
    for (const hash of this.values()) {
      yield this.valuesMap.get(hash)!;
    }
  }
}
