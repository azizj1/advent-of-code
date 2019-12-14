export class ListNode<T> {
    public val: T | null;
    public next: ListNode<T> | null;

    constructor(val: T | null, next: ListNode<T> | null = null) {
        this.val = val;
        this.next = next;
    }
}

export class SinglyLinkedList<T> {
    public head: ListNode<T> | null;
    public tail: ListNode<T> | null;
    public size: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    fromArray(arr: T[]) {
        for (const x of arr.reverse())
            this.unshift(x);
    }

    // insert at beginning
    unshift(item: T) {
        const newNode = new ListNode(item, this.head);
        if (this.tail == null)
            this.tail = newNode;
        this.head = newNode;
        this.size = this.size + 1;
    }

    // remove from front
    shift() {
        if (this.head == null)
            return;
        const node = this.head;
        this.head = this.head.next;
        if (this.tail === node)
            this.tail = null;
        this.size = this.size - 1;
        return node != null ? node.val : null;
    }

    // add to end of queue
    push(item: T) {
        const newNode = new ListNode(item);
        if (this.head == null) {
            this.head = newNode;
            this.tail = newNode;
        }
        else {
            this.tail!.next = newNode;
            this.tail = newNode;
        }
        this.size = this.size + 1;
    }

    // remove from end of queue. O(n) - can be improved by using a doubly linked list
    pop() {
        if (this.tail == null)
            return;
        if (this.head === this.tail) {
            const node = this.tail;
            this.head = null;
            this.tail = null;
            this.size = this.size - 1;
            return node;
        }
        let newTail = this.head;
        while (newTail!.next !== this.tail)
            newTail = newTail!.next;
        const returnNode = this.tail;
        newTail!.next = null;
        this.tail = newTail;
        this.size = this.size - 1;
        return returnNode != null ? returnNode.val : null;
    }

    firstValue() {
        return this.head == null ? null : this.head.val;
    }

    toString() {
        let str = '';
        let node = this.head;
        while (node != null) {
            str += node.val + ',';
            node = node.next;
        }
        return str.slice(0, -1);
    }

    toArray() {
        const arr: T[] = [];
        let node = this.head;
        while (node != null) {
            arr.push(node.val!);
            node = node.next;
        }
        return arr;
    }

    static from<T>(arr: T[]) {
        const s = new SinglyLinkedList<T>();
        s.fromArray(arr);
        return s;
    }
}

export class Queue<T> {
    protected queue: SinglyLinkedList<T>;

    constructor() {
        this.queue = new SinglyLinkedList();
    }

    enqueue(item: T) {
        this.queue.push(item);
    }

    dequeue() {
        const node = this.queue.shift();
        return node == null ? null : node;
    }

    peek() {
        return this.queue.firstValue();
    }

    isEmpty() {
        return this.queue.size === 0;
    }

    toString() {
        return this.queue.toString();
    }

    toArray() {
        return this.queue.toArray();
    }

    size() {
        return this.queue.size;
    }
}

// l1 and l2 can be different sizes
export const addTwoNumbers = (l1: ListNode<number> | null, l2: ListNode<number> | null) => {
    let carryover = 0,
        n1 = l1,
        n2 = l2;
    const s3 = new SinglyLinkedList<number>();
    while (n1 != null || n2 != null) {
        const sum = (n1 && n1.val || 0) + (n2 && n2.val || 0) + carryover;
        s3.push(sum % 10);
        carryover = Math.floor(sum / 10);
        n1 = n1 && n1.next;
        n2 = n2 && n2.next;
    }
    if (carryover > 0)
        s3.push(carryover);
    return s3.head;
};

export const run = (n1: number[], n2: number[]) => {
    const l1 = SinglyLinkedList.from(n1),
          l2 = SinglyLinkedList.from(n2),
          l3 = new SinglyLinkedList<number>();
    console.log(l1.toString());
    console.log(l2.toString());
    l3.head = addTwoNumbers(l1.head, l2.head);
    return l3.toString();
};

// console.log(run([2, 4, 3], [5, 6, 4]));
// console.log(run([9, 9, 9], [9, 9, 9]));
// console.log(run([0, 0], [0, 0]));
// console.log(run([1, 8], [0]));
