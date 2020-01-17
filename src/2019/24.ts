import { getRunsFromIniFile, last } from '~/util/util';
import input from './24.txt';
import { timer } from '~/util/Timer';
import { toString } from '~/2019/17';

export const sideLength = 5;

export const toBinaryGrid = ({name, grid}: {name: string; grid: string[]}) => ({
    name,
    grid: grid.map((g, i) => g === '#' ? (1 << i) : 0).reduce((a, c) => a + c, 0)
});

export const getSimulations = () => getRunsFromIniFile(input).map(ini => ({
    name: ini.name,
    grid: ini.content.replace(/\r?\n/, '').split('').filter(s => s.trim() !== '')
})).map(toBinaryGrid);

export const makeBugAt = (grid: number) => (i: number) => (grid & (1 << i)) >> i;
export const makeHasBugAt = (grid: number) => {
    const bugAt = makeBugAt(grid);
    return (i: number) => bugAt(i) === 1;
};

export const makeGetNumberOfAdjBugs = (grid: number) => (index: number) => {
    let count = 0;
    const bugAt = makeBugAt(grid);
    if (index >= sideLength)
        count += bugAt(index - sideLength); // top
    if (index < sideLength * sideLength - sideLength) // if index < 20
        count += bugAt(index + sideLength); // bottom
    if (Math.floor(index / 5) === Math.floor((index - 1) / 5))
        count += bugAt(index - 1); // left
    if (Math.floor(index / 5) === Math.floor((index + 1) / 5))
        count += bugAt(index + 1); // right
    return count;
};

export const kill = (grid: number, index: number) => grid - (1 << index);
export const infest = (grid: number, index: number) => grid + (1 << index);

export const afterOneMinute = (grid: number) => {
    const hasBugAt = makeHasBugAt(grid);
    const getNumberOfAdjBugs = makeGetNumberOfAdjBugs(grid);
    for (let i = 0; i < sideLength * sideLength; i++) {
        const adjBugs = getNumberOfAdjBugs(i);
        if (hasBugAt(i) && adjBugs !== 1)
            grid = kill(grid, i);
        else if (!hasBugAt(i) && (adjBugs === 1 || adjBugs === 2))
            grid = infest(grid, i);
    }
    return grid;
};

export const toDisplay = (grid: number) => {
    const gridStr: string[] = [];
    const hasBugAt = makeHasBugAt(grid);
    for (let i = 0; i < sideLength * sideLength; i++) {
        if (hasBugAt(i))
            gridStr.push('#');
        else
            gridStr.push('.');
    }
    return gridStr.reduce((a, c, i) => {
        if (i % sideLength === 0)
            a.push([]);
        last(a).push(c);
        return a;
    }, [] as string[][]);
};

export const print = (grid: number) => {
    console.log(toString(toDisplay(grid), ' '));
    console.log();
};

export const getRepeatedGrid = (grid: number) => {
    const allGrids = new Set<number>();
    let curr = grid;
    while (!allGrids.has(curr)) {
        allGrids.add(curr);
        curr = afterOneMinute(curr);
    }
    return curr;
};

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        print(s.grid);
        print(afterOneMinute(s.grid));
        print(afterOneMinute(afterOneMinute(s.grid)));
        print(afterOneMinute(afterOneMinute(afterOneMinute(s.grid))));
        console.log(timer.start(`day 24 - name=${s.name}`));
        console.log(getRepeatedGrid(s.grid));
        console.log(timer.stop());
    }
};
