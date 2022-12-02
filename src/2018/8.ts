import {
  getRunsFromIniCommaSep,
  last,
  declareProblem,
  declareSubproblem,
} from '~/util/util';
import input from './8.txt';
import { timer } from '~/util/Timer';

export const getSimulations = () =>
  getRunsFromIniCommaSep(input, ' ').map((ini) => ({
    name: ini.name,
    list: ini.content.map(Number),
  }));

export interface INode<T> {
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

  getSum(add: (a: T, b: T) => T, nil: T) {
    const helper = (node: INode<T>): T =>
      add(
        node.metadata,
        node.children.reduce((a, c) => add(a, helper(c)), nil)
      );
    return this.root == null ? nil : helper(this.root);
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
    if (node == null) return [];
    if (node.children.length === 0) return [node.metadata.toString()];

    const childrenLines = [
      node.metadata == null ? 'null' : node.metadata.toString(),
    ];
    for (
      let i = 0;
      i < node.children.length - 1;
      i++ // all but last children
    )
      childrenLines.push(
        ...this.toStringAtNode(node.children[i]).map(this.toPrint('├──', '|'))
      );

    childrenLines.push(
      ...this.toStringAtNode(last(node.children)).map(this.toPrint('└──', ' '))
    );
    return childrenLines;
  }

  private toPrint =
    (first: string, other: string) => (d: string, i: number) => {
      if (i === 0) return first + d;
      return other + '  ' + d;
    };

  // see src/2018/8.md
  // type T is the type of the input,
  // type E is the type you want for metadata
  static from<T, E extends IBaseNode>(arr: T[], addToMeta: (a: E, b: T) => E, nil: E) {
    const helper = (
      startIndex: number
    ): { node: INode<E>; nextIndex: number } => {
      const node: INode<E> = {
        children: [],
        metadata: nil,
      };
      const numOfChildren = arr[startIndex] ?? 0;
      const numOfMeta = arr[startIndex + 1] ?? 0;
      let childIndex = startIndex + 2;

      for (let i = 0; i < numOfChildren && childIndex < arr.length; i++) {
        const childResult = helper(childIndex);
        childIndex = childResult.nextIndex;
        node.children.push(childResult.node);
      }

      for (let i = 0; i < numOfMeta && childIndex < arr.length; i++) {
        node.metadata = addToMeta(node.metadata, arr[childIndex++]);
      }
      return {
        node,
        nextIndex: childIndex,
      };
    };
    return new NaryTree(helper(0).node);
  }
}

const preCompute = (list: number[]) => {
  const tree = NaryTree.from<number, number>(list, (a, b) => a + b, 0);
  return tree.getSum((a, b) => a + b, 0);
};

const postCompute = (list: number[]) => {
  const tree = NaryTree.from<number, number[]>(list, (a, b) => [...a, b], []);
  return tree.getSum((a, b) => a.concat(b), []).reduce((a, c) => a + c, 0);
};

const runAg = (ag: (list: number[]) => number, title: string) => {
  declareSubproblem(title);
  const sims = getSimulations().slice(0, 1);
  for (const s of sims) {
    console.log(timer.start(`name=${s.name} size=${s.list.length}`));
    console.log(ag(s.list));
    console.log(timer.stop());
  }
};

export const run = () => {
  declareProblem('8');
  [
    {
      f: preCompute,
      n: 'add first',
    },
    {
      f: postCompute,
      n: 'add later',
    },
  ].map((a) => runAg(a.f, a.n));
};
