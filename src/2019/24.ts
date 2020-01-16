import { getRunsFromIniFile } from '~/util/util';
import input from './24.txt';
import { timer } from '~/util/Timer';

const sideLength = 5;

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

// export const toDisplay = (grid: number) => {
//     const gridStr: string[][] = [];
//     for (cle t)
// }

export const run = () => {
    const sims = getSimulations().slice(0, 1);
    for (const s of sims) {
        console.log(timer.start(`day 24 - name=${s.name}`));
        console.log();
        console.log(timer.stop());
    }
};
