import { GenericSet, HashFunction } from '~/util/GenericSet';

type Comparator<E> = (a: E, b: E) => number;

export class SortedSet<E> extends GenericSet<E> {
    private comparator: Comparator<E>;
    private isSorted: boolean;
    private lazySortedArray: E[];

    constructor(getHash: HashFunction<E>, comparator: Comparator<E>, data?: E[]) {
        super(getHash, data ?? []);
        this.comparator = comparator;
        this.isSorted = false;
        this.lazySortedArray = [...data ?? []];
    }

    add(e: E) {
        if (this.lazySortedArray == null)
            this.lazySortedArray = [];
        if (!this.has(e)) {
            this.lazySortedArray.push(e);
            this.isSorted = false;
            super.add(e);
        }
        return this;
    }

    delete(e: E) {
        const hash = this.getHash(e);
        const hasItem = super.delete(e);
        if (hasItem)
            this.lazySortedArray.splice(this.lazySortedArray.findIndex(item => this.getHash(item) === hash), 1);
        return hasItem;
    }

    get sortedValues() {
        if (this.isSorted)
            return this.lazySortedArray;
        this.isSorted = true;
        this.lazySortedArray.sort(this.comparator);
        return this.lazySortedArray;
    }

    clone() {
        return new SortedSet<E>(this.getHash, this.comparator, this.lazySortedArray);
    }
}
