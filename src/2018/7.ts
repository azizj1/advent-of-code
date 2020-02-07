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

const printGraph = (graph: Graph<string>) => {
    const vertices = Array.from(graph.vertices).sort((a, b) => a.localeCompare(b));
    vertices.forEach(v => {
        console.log(`${v} -> ${Array.from(graph.edges.get(v) ?? new Set<string>()).sort((a, b) => a.localeCompare(b))}`);
    });
    console.log('============');
};

// export const topologicalSort2 = ({graph}: ISimulation) => {
//     const visited = new Set<string>();
//     const finalResult: string[] = [];

//     const helper = (startNode: string): string[] => {
//         if (visited.has(startNode))
//             return [];
//         visited.add(startNode);


//     };
// };

export const topologicalSort = ({graph}: ISimulation) => {
    printGraph(graph);
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
            const adjList = Array.from(graph.edges.get(curr) ?? new Set<string>());
            adjList.sort((a, b) => b.localeCompare(a)); // we want the last one to be first
            if (adjList.filter(a => !visited.has(a)).length === 0) {
                result.push(stack.pop()!);
                continue;
            }
            console.log(`at ${curr} -> ${adjList.join(',')}`);

            for (const adj of adjList) {
                if (visited.has(adj))
                    continue;
                visited.add(adj);
                stack.push(adj);
            }
        }
        console.log('-------------');
        console.log(result);
        console.log('-------------');
        return result;
    };

    const startingVertices = Array.from(graph.vertices).filter(v => graph.edges.get(v) == null).sort((a, b) => a.localeCompare(b));
    for (const v of startingVertices)
        finalResult.push(...helper(v));
    return finalResult.join('');
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
        f: topologicalSort,
        n: 'stack'
    }].map(s => runAg(s.f, s.n));
};
