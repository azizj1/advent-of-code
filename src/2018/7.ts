import { getRunsFromIniNewlineSep, declareSubproblem, declareProblem } from '~/util/util';
import input from './7.txt';
import { Graph } from '~/util/Graph';
import { timer } from '~/util/Timer';
import { PriorityQueue } from '~/util/PriorityQueue';

export interface ISimulation {
    name: string;
    graph: Graph<string>;
    numOfWorkers: number; // part 2
    minSeconds: number; // part 2
}

export const getSimulations = (): ISimulation[] => getRunsFromIniNewlineSep(input)
    .map(ini => ({
        name: ini.name.split(',')[0],
        numOfWorkers: Number(ini.name.split(',')[1]),
        minSeconds: Number(ini.name.split(',')[2]),
        edges: ini.content.map<[string, string]>(c =>
            c.match(/Step (\w+) must be finished before step (\w+)/)!.slice(1, 3) as [string, string]
        )}))
    .map(({name, edges, numOfWorkers, minSeconds}) => {
        const graph = new Graph<string>();
        for (const [from, to] of edges)
            graph.addDirectedEdge(to, from);
        return {
            name,
            graph,
            numOfWorkers,
            minSeconds
        };
    });

export const printGraph = (graph: Graph<string>) => {
    const vertices = Array.from(graph.vertices).sort((a, b) => a.localeCompare(b));
    vertices.forEach(v => {
        console.log(`${v} -> ${Array.from(graph.edges.get(v) ?? new Set<string>()).sort((a, b) => a.localeCompare(b))}`);
    });
    console.log('============');
};

export interface IQueueState {
    node: string;
    mustBeAfter: Set<string>;
}

export const getOrderedToplogicalSortQueue = (graph: Graph<string>) => {
    const queue = new PriorityQueue<IQueueState>(({node, mustBeAfter}) =>
        -1 * (mustBeAfter.size * 100 + node.charCodeAt(0)));
    graph.vertices.forEach(v =>
            queue.enqueue({node: v, mustBeAfter: graph.edges.get(v) ?? new Set()}));
    return queue;
};

export const toplogicalSort = ({graph}: ISimulation) => {
    const queue = getOrderedToplogicalSortQueue(graph);
    const result: string[] = [];

    while (!queue.isEmpty()) {
        const { node } = queue.dequeue()!;
        result.push(node);
        queue.values.forEach(v => v.mustBeAfter.delete(node));
        queue.heapify();
    }
    return result.join('');
};

export const runAg = (ag: (s: ISimulation) => string, title: string) => {
    const sims = getSimulations();
    declareSubproblem(title);
    for (const s of sims) {
        console.log(timer.start(`name=${s.name}, edges=${JSON.stringify(s.graph.size)}`));
        console.log(ag(s));
        // console.log(s.graph.getToplogicalSort().join(''));
        console.log(timer.stop());
    }
};

export const run = () => {
    declareProblem('7');
    [{
        f: toplogicalSort,
        n: 'stack'
    }].map(s => runAg(s.f, s.n));
};
