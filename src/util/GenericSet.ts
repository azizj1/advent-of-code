export type HashFunction<E> = (e: E) => string | number;

export class GenericSet<E> extends Set<E | string | number> {
    protected getHash: HashFunction<E>;

    /* eslint-disable no-dupe-class-members */
    constructor(toClone: GenericSet<E>);
    constructor(getHash: HashFunction<E>);
    constructor(getHash: HashFunction<E>, data: E[]);
    constructor(setOrHash: GenericSet<E> | HashFunction<E>, data?: E[]) {
        super();
        if (typeof setOrHash === 'function') {
            this.getHash = setOrHash;
            for (const d of data ?? [])
                this.add(d);
        }
        else {
            this.getHash = setOrHash.getHash;
            for (const d of setOrHash)
                super.add(d);
        }
    }
    /* eslint-enable no-dupe-class-members */

    add(e: E) {
        super.add(this.getHash(e));
        return this;
    }

    delete(e: E) {
        return super.delete(this.getHash(e));
    }

    has(e: E) {
        return super.has(this.getHash(e));
    }

    hasHash(h: string | number) {
        return super.has(h);
    }

    equals(other: GenericSet<E>) {
        if (this.size !== other.size)
            return false;
        for (const item of other.values())
            if (!super.has(item))
                return false;
        return true;
    }

    subsetOf(parent: GenericSet<E>) {
        for (const item of this.values())
            if (!parent.hasHash(item as string | number))
                return false;
        return true;
    }
}
