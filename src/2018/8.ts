import { getRunsFromIniCommaSep, last, declareProblem } from '~/util/util';
import input from './8.txt';
import { timer } from '~/util/Timer';

export const getSimulations = () => getRunsFromIniCommaSep(input, ' ').map(ini => ({
    name: ini.name,
    list: ini.content.map(Number)
}));

interface INode<T> {
    children: INode<T>[];
    metadata: T;
}

interface IBaseNode {
    toString(): string;
}

export class NaryTree<T extends IBaseNode> {
    public root: INode<T> | null;

    constructor(root: INode<T> | null = null) {
        this.root = root;
    }

    getSum() {
        const helper = (node: INode<T>): number =>
            (node.metadata as unknown as number) + node.children.reduce((a, c) => a + helper(c), 0);
        return this.root == null ? 0 : helper(this.root);
    }

    toString() {
        const x = this.toStringAtNode(this.root);
        return x.join('\n');
    }

    /*
        work backwards. First know that the below
        1
        ├──2
        |  ├──4
        |  └──5
        └──3
        is made from this array: [ '1', '├──2', '|  ├──4', '|  └──5', '└──3' ]
        it'll DFS all the way to '['4'] and ['5'], which the parent ['2']
        sees as ['4', '5'], which then maps that to ['2', ...['├──4'], ...['└──5']],
        making it ['2', '├──4', '└──5'] and ['└──3']
        then its parent will do
        ['1', ...['2', '├──4', '└──5'].map(toPrint('├──', '|')), ...['└──3'].map(toPrint('├──', '|'))]
        which returns
        ['1', ...['├──2', '|  ├──4', '|  └──5'], ...['└──3']]
        which then
        ['1', '├──2', '|  ├──4', '|  └──5', '└──3']
    */
    private toStringAtNode(node: INode<T> | null): string[] {
        if (node == null)
            return [];
        if (node.children.length === 0)
            return [node.metadata.toString()];

        if (node.children.length === 1)
            return [
                node.metadata == null ? 'null' : node.metadata.toString(),
                ...this.toStringAtNode(node.children[0]).map(this.toPrint('└──')),
            ];
        const childrenLines = [node.metadata == null ? 'null' : node.metadata.toString()];
        for (let i = 0; i < node.children.length - 1; i++)
            childrenLines.push(...this.toStringAtNode(node.children[i]).map(this.toPrint('├──', '|')));

        childrenLines.push(...this.toStringAtNode(last(node.children)).map(this.toPrint('└──', ' ')));
        return childrenLines;
    }

    private toPrint = (first: string, other?: string) => (d: string, i: number, a: string[]) => {
        if (a.length === 0)
            return '';
        else if (i === 0)
            return first + d;
        return other + '  ' + d;
    }
}

const toTree = ({list}: {list: number[]}) => {
    const helper = (startIndex: number): {node: INode<number>; nextIndex: number} => {
        const node: INode<number> = {
            children: [],
            metadata: 0
        };
        const numOfChildren = list[startIndex] ?? 0;
        const numOfMeta = list[startIndex + 1] ?? 0;
        let childIndex = startIndex + 2;

        for (let i = 0; i < numOfChildren && childIndex < list.length; i++) {
            const childResult = helper(childIndex);
            childIndex = childResult.nextIndex;
            node.children.push(childResult.node);
        }

        for (let i = 0; i < numOfMeta && childIndex < list.length; i++) {
            node.metadata += list[childIndex++];
        }
        return {
            node,
            nextIndex: childIndex
        };
    };
    return helper(0);
};

export const run = () => {
    declareProblem('8');
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`name=${s.name} size=${s.list.length}`));
        const tree = new NaryTree(toTree(s).node);
        console.log(tree.toString());
        console.log(tree.getSum());
        console.log(timer.stop());
    }
};
