import { Graph } from '~/util/Graph';
import { timer } from '~/util/Timer';
import * as input from './6.json';

export const ans = (edgelist: string[]) => {
    const graph = new Graph<string>();
    edgelist.forEach(e => {
        const [from, to] = e.split(')');
        graph.addDirectedEdge(from, to);
    });
    // await fs.writeFile('logs/output.txt', graph.toString());
    // await fs.writeFile('logs/output2.txt', graph.getToplogicalSort().join('\n'));
    return graph.allDistancesFrom('COM');
};

console.log(timer.start('6'));
console.log(ans(input.edgelist));
console.log(timer.stop());
