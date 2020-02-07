import { getRunsFromIniNewlineSep, declareSubproblem, declareProblem, last } from '~/util/util';
import input from './7.txt';
import { Graph } from '~/util/Graph';
import { timer } from '~/util/Timer';

interface ISimulation {
    name: string;
    graph: Graph<string>;
}

export const getSimulations = (): ISimulation[] => getRunsFromIniNewlineSep(input)
    .map(ini => ({
        name: ini.name,
        edges: ini.content.map<[string, string]>(c =>
            c.match(/Step (\w+) must be finished before step (\w+)/)!.slice(1, 3) as [string, string]
        )}))
    .map(({name, edges}) => {
        const graph = new Graph<string>();
        for (const [from, to] of edges)
            graph.addDirectedEdge(to, from);
        return {
            name,
            graph
        };
    });

export const topologicalSort = ({graph}: ISimulation) => {
    console.log(graph.toString());
    const visited = new Set();
    const stack: string[] = [];
    const finalResult: string[] = [];

    const helper = (startNode: string) => {
        // console.log(`starting at ${startNode}`);
        if (visited.has(startNode))
            return [];

        stack.push(startNode);
        visited.add(startNode);
        const result: string[] = [];

        while (stack.length > 0) {
            const curr = last(stack);
            const adjList = graph.edges.get(curr) ?? new Set();

            for (const adj of adjList) {
                if (visited.has(adj))
                    continue;
                visited.add(adj);
                stack.push(adj);
            }
            result.push(stack.pop()!);
        }
        return result;
    };

    for (const v of Array.from(graph.vertices).sort((a, b) => a.localeCompare(b)))
        finalResult.push(...helper(v));
    return finalResult.join('');
};

export const runAg = (ag: (s: ISimulation) => string, title: string) => {
    const sims = getSimulations();
    declareSubproblem(title);
    for (const s of sims) {
        console.log(timer.start(`name=${s.name}, edges=${JSON.stringify(s.graph.size)}`));
        console.log(ag(s));
        console.log(s.graph.getToplogicalSort().join(''));
        console.log(timer.stop());
    }
};

export const run = () => {
    declareProblem('7');
    [{
        f: topologicalSort,
        n: 'stack'
    }].map(s => runAg(s.f, s.n));
};
