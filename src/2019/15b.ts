import { IntcodeComputer } from '~/2019/9';
import { IPoint, add } from '~/2019/10';
import { IDirection, directions, negDirection, east, north, south, west } from '~/2019/15';
import { timer } from '~/util/Timer';
import { last, first } from '~/util/util';
import { Queue } from '~/util/Queue';
import chalk from 'chalk';
import * as input from './15.json';

const wall = 0; // position hasn't changed
const open = 1; // position changed
const oxygen = 2; // position changed
const starting = 3;

const statuses = [wall, open, oxygen, starting] as const;
type IStatus = typeof statuses[number];

export const dy = {
    [north]: -1,
    [south]: 1,
    [east]: 0,
    [west]: 0
} as const;

export const dx = {
    [north]: 0,
    [south]: 0,
    [east]: 1,
    [west]: -1
} as const;

export const delta = (d: IDirection) => ({col: dx[d], row: dy[d]});

export const draw = (comp: IntcodeComputer) => {
    const allSteps: {steps: number; at: IPoint}[] = [];
    const grid: IStatus[][] = [];

    const markPoint = (mark: IStatus, {col, row}: IPoint) => {
        if (grid[row] == null)
            grid[row] = [];
        grid[row][col] = mark;
    };

    const helper = (steps: number, reverse: IDirection, point: IPoint) => {
        markPoint(open, point);

        for (const d of directions) {
            const newPoint = add(point)(delta(d));
            if (d === reverse) // don't go back!
                continue;
            const output = comp.run(d);
            if (output === open)
                helper(steps + 1, negDirection[d], newPoint);
            else if (output === oxygen) {
                console.log(`found a solution at (${newPoint.row},${newPoint.col})! Took ${steps + 1}`);
                markPoint(oxygen, newPoint);
                allSteps.push({steps: steps + 1, at: newPoint});
                comp.run(reverse);
            }
            else {
                markPoint(wall, newPoint);
            }
        }
        if (steps > 0)
            comp.run(reverse);
    };

    helper(0, negDirection[east], {col: 0, row: 0});
    markPoint(starting, {col: 0, row: 0});
    return {grid, oxygenSystem: first(allSteps.sort((a, b) => a.steps - b.steps))};
};

export const getPaintMark = (withColor: boolean) => (mark: IStatus) => {
    if (withColor) {
        switch (mark) {
            case wall: return '#';
            case open: return chalk.redBright('.');
            case oxygen: return chalk.cyanBright('O');
            case starting: return chalk.magenta('S');
            default: return ' ';
        }
    }
    else {
        switch (mark) {
            case wall: return '#';
            case open: return '.';
            case oxygen: return 'O';
            case starting: return 'S';
            default: return ' ';
        }
    }
};

export const coloredGrid = <T>(grid: T[][], getMark: (i: T) => string) => {
    const rowIndices = Object.keys(grid).map(Number).sort((a, b) => a - b);
    const getColIndices = (row: T[]) => Object.keys(row).map(Number).sort((a, b) => a - b);
    const minCol = Math.min(...grid.map(getColIndices)[0]);
    const maxCol = Math.max(...last(grid.map(getColIndices)));

    const translatedGrid: string[][] = [];
    for (let i = 0; i < rowIndices.length; i++) {
        const row = grid[rowIndices[i]];
        translatedGrid[i] = [];
        for (let j = 0; j <= maxCol - minCol; j++) {
            translatedGrid[i][j] = getMark(row[minCol + j]);
        }
    }
    return translatedGrid;
};

// the translation logic is in paint()
export const toString = (grid: string[][]) => grid.map(r => r.join(' ')).join('\n');

export const minsTilOyxgenFilled = (grid: IStatus[][], from: IPoint) => {
    let minutes = 0;
    const queue = new Queue<IPoint>();
    queue.enqueue(from);

    while (!queue.isEmpty()) {
        minutes++;
        const pointsToQueue: IPoint[] = [];

        while (!queue.isEmpty()) {
            const p = queue.dequeue()!;

            for (const d of directions) {
                const newPoint = add(p)(delta(d));
                const cell = grid[newPoint.row][newPoint.col];
                if (cell === open || cell === starting) {
                    pointsToQueue.push(newPoint);
                    grid[newPoint.row][newPoint.col] = oxygen;
                }
            }
        }

        pointsToQueue.forEach(p => queue.enqueue(p));
    }
    return minutes - 1;
};

export const run = () => {
    console.log(timer.start('15b'));
    const { grid, oxygenSystem } = draw(new IntcodeComputer(input.data));
    console.log(toString(coloredGrid(grid, getPaintMark(true))));
    console.log(minsTilOyxgenFilled(grid, oxygenSystem.at));
    console.log(timer.stop());
};
