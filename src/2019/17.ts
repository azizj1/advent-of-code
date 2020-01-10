import { IntcodeComputer } from '~/2019/9';
import * as input from './17.json';
import { last } from '~/util/util';
import { timer } from '~/util/Timer';

const makeIsScaffold = (grid: string[][]) => (row: number, col: number) => grid[row]?.[col] === '#';

const makeIsIntersection = (grid: string[][]) => {
    const isScaffold = makeIsScaffold(grid);
    return (row: number, col: number) =>
        isScaffold(row, col) &&
        isScaffold(row + 1, col) &&
        isScaffold(row - 1, col) &&
        isScaffold(row, col + 1) &&
        isScaffold(row, col - 1);
};

export const getIntersections = (grid: string[][]) => {
    const isIntersection = makeIsIntersection(grid);
    const interactions: [number, number][] = [];
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++)
            if (isIntersection(i, j))
                interactions.push([i, j]);
    return interactions;
};

const getCameraOutput = (comp: IntcodeComputer) => {
    const output: string[][] = [[]];
    while (comp.hasMore()) {
        const ret = comp.run();
        if (ret === 10)
            output.push([]);
        else
            last(output).push(String.fromCharCode(ret));
    }
    return output.slice(0, -2);
};

export const toString = (grid: string[][], delim = ' ') => grid.map(r => r.join(delim)).join('\n');

const prodSumInteractions = (interactions: [number, number][]) => interactions.reduce((a, [r, c]) => a + r * c, 0);

export const run = () => {
    console.log(timer.start('17'));
    const grid = getCameraOutput(new IntcodeComputer(input.data));
    console.log(toString(grid));
    console.log(prodSumInteractions(getIntersections(grid)));
    console.log(timer.stop());
};
