/*
    Since complete binary heaps handle insertion level-by-level, we can just use an array to
    to hold our data, and use a level-ordered algorithm to dictate how each point is stored
    E.g., if we have the heap
        50
        / \
      19   4
      / \
     3   6
    it'll be represented as [50, 19, 4, 3, 6]

    REMEMBER: Heaps are not binary trees. The only rule for heaps is that both children of a node must be less than
    the node itself, so if it's just [50, 19], and we're about to add a 4, it'll become [50, 19, 4], which is
        50
        / \
      19   4
    and now if we add the element 3, it'll become [50, 19, 4, 3], and represented as
        50
        / \
      19   4
      /
     3

     What happens if we were to insert 36, though? We push it to the array, making it [50, 19, 4, 3, 36], and then
     compare 36 to its parent, which is Math.floor(x / 2), where x = new element = arr.length - 1. All we do is swap!
     And we get [50, 36, 4, 3, 19]
*/

class Node<T> {
    public val: T;
    public priority: number;

    constructor(item: T, priority: number) {
        this.val = item;
        this.priority = priority;
    }
}

type PriorityFunction<T> = (item: T) => number;

// This is s MAX HEAP Priority Queue. Highest priority is at front, and what will be retrieved first
// To make it a MIN heap, just multiply priority by -1 before adding it to queue.
export class PriorityQueue<T> {
    // first element is null, rest is type of Node<T>. Why is the first element null? See poll()
    private heap: [null, ...Array<Node<T>>];
    private prioritizer: PriorityFunction<T>;

    constructor(comparator: PriorityFunction<T>) {
        this.heap = [null];
        this.prioritizer = comparator;
    }

    // O(log N)
    enqueue(item: T) {
        const priority = this.prioritizer(item);
        const node = new Node(item, priority);
        this.heap.push(node);
        let nodeIndex = this.heap.length - 1;
        let parentIndex = Math.floor(nodeIndex / 2);

        while (this.heap[parentIndex] != null && this.heap[parentIndex]!.priority < priority) {
            this.swap(nodeIndex, parentIndex);
            nodeIndex = parentIndex;
            parentIndex = Math.floor(nodeIndex / 2);
        }
        return this;
    }

    // O(log N)
    // this is removal of the highest priority, which is always the first element in the array after the null
    // we can't just do shift() because if we have something like this: [50, 40, 90], it'll become [40, 90], and 90
    // is greater. Plus, that's a O(N) operation. We can do O(log N)
    // All we do is 1) swap last element with first element. 2) Pop last element out. 3) since it's likely that
    // the the first node's children are larger now, we go down the tree, swapping elements as we progress.
    // We swap parentX with Math.max(leftRight, rightChild). I.e., if front node is at index X, we check 2X and 2X + 1
    // which is where X's children will be.
    // This also explains why the first element is NULL. With the first element starting at index = 1, we can find its
    // children by doing 2*1 and 2*1 + 1. If first element was at index = 0, we'd be screwed, because 2*0 = 0
    dequeue() {
        if (this.heap.length <= 2) { // i.e, there is only 1 element. [null, singleElement]
            const removedElement = this.heap.pop();
            this.heap[0] = null;
            return removedElement == null ? removedElement : removedElement.val;
        }
        this.swap(1, this.heap.length - 1);
        const removedElement = this.heap.pop();
        let nodeIndex = 1;
        let higherPriorityChildIndex = this.getMaxChildIndex(nodeIndex);
        while (
            this.heap[higherPriorityChildIndex] != null &&
            this.heap[higherPriorityChildIndex]!.priority >= this.heap[nodeIndex]!.priority
        ) {
            this.swap(higherPriorityChildIndex, nodeIndex);
            nodeIndex = higherPriorityChildIndex;
            higherPriorityChildIndex = this.getMaxChildIndex(nodeIndex);
        }
        return removedElement!.val;
    }

    peek() {
        return this.heap[1] != null ? this.heap[1].val : null;
    }

    isEmpty() {
        return this.heap.length <= 1;
    }

    size() {
        return this.heap.length - 1;
    }

    set values(items: T[]) {
        this.heap = [null, ...items.map(v => new Node(v, this.prioritizer(v)))];
        this.heapify();
    }

    get values() {
        return this.heap.slice(1).map(v => v!.val);
    }

    remove(item: T) {
        const priority = this.prioritizer(item);
        this.heap = this.heap.filter(i => priority !== i?.priority) as [null, ...Array<Node<T>>];
        this.heapify();
    }

    // O(N) - see CLRS book.
    heapify() {
        const n = this.heap.length;
        const helper = (parentIndex: number) => {
            let largestIndex = parentIndex;
            const leftChildIndex = parentIndex * 2;
            const rightChildIndex = parentIndex * 2 + 1;

            if (leftChildIndex < n && this.heap[leftChildIndex]!.priority > this.heap[largestIndex]!.priority)
                largestIndex = leftChildIndex;
            if (rightChildIndex < n && this.heap[rightChildIndex]!.priority > this.heap[largestIndex]!.priority)
                largestIndex = rightChildIndex;

            if (largestIndex !== parentIndex) {
                this.swap(parentIndex, largestIndex);
                helper(largestIndex);
            }
        };

        for (let i = 1; i < n; i++)
            this.heap[i]!.priority = this.prioritizer(this.heap[i]!.val);
        for (let i = Math.floor((n - 1) / 2); i > 0; i--)
            helper(i);
    }

    private swap(indexA: number, indexB: number) {
        const temp = this.heap[indexA];
        this.heap[indexA] = this.heap[indexB];
        this.heap[indexB] = temp;
    }

    private getMaxChildIndex(index: number) {
        const leftChildIndex = 2 * index;
        const rightChildIndex = 2 * index + 1;
        if (rightChildIndex >= this.heap.length || leftChildIndex >= this.heap.length)
            return leftChildIndex;
        return this.heap[leftChildIndex]!.priority > this.heap[rightChildIndex]!.priority ?
            leftChildIndex :
            rightChildIndex;
    }
}
