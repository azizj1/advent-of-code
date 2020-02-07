import { Queue } from '~/util/Queue';

export class Graph<T> {
    public vertices: Set<T>;
    public edges: Map<T, Set<T>>;

    constructor() {
        this.vertices = new Set();
        this.edges = new Map();
    }

    addUndirectedEdge(from: T, to: T) {
        this.addDirectedEdge(from, to);
        this.addDirectedEdge(to, from);
    }

    addDirectedEdge(from: T, to: T) {
        // because it's a set, if it already exists, it won't do anything.
        this.vertices.add(from);
        this.vertices.add(to);

        if (!this.edges.has(from))
            this.edges.set(from, new Set());

        this.edges.get(from)!.add(to);
    }

    addVertex(node: T) {
        this.vertices.add(node);
        if (!this.edges.has(node))
            this.edges.set(node, new Set());
    }

    hasEdge(from: T, to: T) {
        return this.edges.has(from) && this.edges.get(from)!.has(to);
    }

    get size() {
        return {
            vertices: this.vertices.size,
            edges: this.edges.size
        };
    }

    // would be identical to BFS search if it wasn't for the added `distances` Map, which tracks the distance of node u
    // from the start node.
    // and this would be identical to the BST BFS if it wasn't for the visited Set. That's what makes it a graph BFS
    // instead of a BST BFS.
    shortestPath(from: T, to: T) {
        // IMPROVEMENT: You don't even need the visited Set. Instead of doing visited.has(), you can do distances.has()
        if (from === to)
            return 0;
        if (!this.vertices.has(from) || !this.vertices.has(to))
            return Infinity;

        const visited = new Set<T>();
        const queue = new Queue<T>();
        const distances = new Map<T, number>();

        queue.enqueue(from);
        visited.add(from);
        distances.set(from, 0);

        while (!queue.isEmpty()) {
            const v = queue.dequeue()!;
            const adj = this.edges.get(v)!;
            const currDistance = distances.get(v)!;

            for (const u of adj) {
                if (u === to)
                    return currDistance + 1;
                if (!visited.has(u)) {
                    distances.set(u, currDistance + 1);
                    visited.add(u);
                    queue.enqueue(u);
                }
            }
        }
        return Infinity;
    }

    allDistancesBetween(from: T, to: T) {
        const queue = new Queue<T>();
        const distances = new Map<T, number>();
        // const paths = new Map<T, T[]>();
        if (from === to || !this.vertices.has(from) || !this.vertices.has(to))
            return distances;

        queue.enqueue(from);
        distances.set(from, 0);
        // for (let v of this.vertices.values())
        //     paths.set(v, []); // initialize the paths array

        while (!queue.isEmpty()) {
            let foundEnd = false;

            while (!queue.isEmpty()) {
                const curr = queue.dequeue()!;
                const currDistance = distances.get(curr)!;
                const neighbors = this.edges.get(curr)!;

                for (const neighbor of neighbors) {
                    // paths.get(curr)!.push(neighbor);
                    if (distances.has(neighbor)) // already visited
                        continue;
                    distances.set(neighbor, currDistance + 1);

                    if (neighbor === to)
                        foundEnd = true;
                    else
                        queue.enqueue(neighbor);
                }
                if (foundEnd)
                    break;
            }
        }
        return distances;
    }

    allDistancesFrom(from: T): number {
        if (from == null || !this.edges.has(from))
            return 0;
        const queue = new Queue<{node: T; distanceFromRoot: number}>();
        queue.enqueue({node: from, distanceFromRoot: 0});
        let sum = 0;

        while (!queue.isEmpty()) {
            const {node, distanceFromRoot} = queue.dequeue()!;
            sum += distanceFromRoot;

            if (!this.edges.has(node))
                continue;
            for (const neighbor of this.edges.get(node)!)
                queue.enqueue({node: neighbor, distanceFromRoot: distanceFromRoot + 1});
        }

        return sum;
    }

    toString() {
        let str = '';
        for (const [key, val] of this.edges.entries())
            str += `${key} -> ${Array.from(val).join(',')}\n`;
        return str;
    }

    // for comments, see ../word-ladder-2.md
    getAllPaths(from: T, to: T) {
        const distances = this.allDistancesBetween(from, to);
        const initialPath: T[] = [];
        const solutions: T[][] = [];

        const helper = (current: T, currentPath: T[], allPaths: T[][]) => {
            currentPath.push(current);

            if (current === to)
                allPaths.push([...currentPath]);
            else {
                const neighbors = this.edges.has(current) ? this.edges.get(current)!.values() : [];
                for (const neighbor of neighbors) {
                    if (distances.get(neighbor) === distances.get(current)! + 1)
                        helper(neighbor, currentPath, allPaths);
                }
            }
            currentPath.pop();
        };
        helper(from, initialPath, solutions);
        return solutions;
    }

    hasCycles() {
        const traverse = (from: T, visited: Set<T>, finished: Set<T>): boolean => {
            if (visited.has(from))
                return true;
            if (finished.has(from))
                return false;
            if (!this.edges.has(from))
                return false;

            visited.add(from);
            for (const neighbor of this.edges.get(from)!)
                if (traverse(neighbor, visited, finished))
                    return true;
            visited.delete(from);
            finished.add(from);
            return false;
        };

        const finishedAnalyzing = new Set<T>();
        for (const v of this.vertices)
            if (traverse(v, new Set(), finishedAnalyzing))
                return true;
        return false;
    }

    // white = unvisited
    // gray = evaluating its children, i.e., still doing the for-loop recursion
    // black = visited node and all of its children, if any
    getToplogicalSort() {
        type Color = 'white' | 'gray' | 'black';
        const stack: T[] = [];
        const nodeColor = new Map<T, Color>();
        const isUnvisited = (node: T) => nodeColor.get(node) === 'white';
        const isVisiting = (node: T) => nodeColor.get(node) === 'gray';
        let isPossible = true;

        for (const v of this.vertices)
            nodeColor.set(v, 'white');

        const helper = (node: T) => {
            if (!isPossible)
                return;

            nodeColor.set(node, 'gray');
            if (this.edges.has(node)) {
                for (const neighbor of this.edges.get(node)!) {
                    if (isUnvisited(neighbor))
                        helper(neighbor);
                    else if (isVisiting(neighbor))
                        isPossible = false; // edge to a gray neighbor represents a cycle
                }
            }
            nodeColor.set(node, 'black');
            stack.push(node);
        };

        for (const v of this.vertices)
            if (isUnvisited(v))
                helper(v);

        return isPossible ? stack : [];
    }
}
