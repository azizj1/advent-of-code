export class GenericSet<E> extends Set<E | string | number> {
    private getHash: (e: E) => string | number;

    constructor(getHash: (e: E) => string | number, data?: E[]) {
        super();
        this.getHash = getHash;
        for (const d of data ?? [])
            this.add(d);
    }

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
}
