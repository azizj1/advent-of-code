import { NaryTree, INode, getSimulations } from '~/2018/8';
import { declareProblem } from '~/util/util';
import { timer } from '~/util/Timer';

const getSum = (list: number[]) => {
    const tree = NaryTree.from<number, number[]>(list, (a, b) => [...a, b], []);
    const helper = (node: INode<number[]>): number => {
        if (node.children.length === 0)
            return node.metadata.reduce((a, c) => a + c, 0);

        let sum = 0;
        for (let i = 0; i < node.metadata.length; i++)
            if (node.metadata[i] <= node.children.length)
                sum += helper(node.children[node.metadata[i] - 1]);
        return sum;
    };

    return tree.root == null ? 0 : helper(tree.root);
};

export const run = () => {
    declareProblem('8b');
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`name=${s.name}, size=${s.list.length}`));
        console.log(getSum(s.list));
        console.log(timer.stop());
    }
};
