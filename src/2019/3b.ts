import { timer } from '~/util/Timer';
import * as input from './3.json';

export interface IPoint {
    x: number;
    y: number;
}

const dy = {'R': 0, 'L': 0, 'U': -1, 'D': 1};
const dx = {'R': 1, 'L': -1, 'U': 0, 'D': 0};

const validDirection = (direction: string): direction is 'R' | 'D' | 'U' | 'L' =>
    ['R', 'L', 'U', 'D'].includes(direction);

export const populate = (grid: number[][][], starting: IPoint, displacement: string, wireNumber: number) => {
    const direction = displacement[0];
    const distance = Number(displacement.slice(1));
    if (!validDirection(direction))
        throw new Error();

    const { x, y } = starting;
    let newStarting = starting;
    let closestDuplicate = 1_000_000_000;
    const updateDupe = (allWires: number[]) => {
        closestDuplicate = Math.min(closestDuplicate, allWires.reduce((a, c) => a + c, 0));
    };
    const set = (px: number, py: number, by: number) => {
        if (grid[py] == null)
            grid[py] = [];
        if (grid[py][px] == null)
            grid[py][px] = [];
        if (grid[py][px][wireNumber] == null)
            grid[py][px][wireNumber] = by;
        if (grid[py][px].filter(w => w != null).length > 1)
            updateDupe(grid[py][px]);
    };
    newStarting = { x: x + dx[direction] * distance, y: y + dy[direction] * distance };
    for (let i = 1; i <= distance; i++) {
        const nx = x + dx[direction] * i;
        const ny = y + dy[direction] * i;
        set(nx, ny, grid[y][x][wireNumber] + i);
    }
    return {newStarting, closestDuplicate};
};

export const ans = async (wire1: string[], wire2: string[]) => {
    let starting = {x: 0, y: 0};
    let closestIntersection = 1_000_000_000_000;

    const grid: number[][][] = [];
    grid[0] = [[0, 0]]; // distance for both wire 1 and 2 start off with 0

    for (const c1 of wire1) {
        const result = populate(grid, starting, c1, 0);
        starting = result.newStarting;
    }

    starting = {x: 0, y: 0};
    for (const c2 of wire2) {
        const result = populate(grid, starting, c2, 1);
        starting = result.newStarting;
        closestIntersection = Math.min(closestIntersection, result.closestDuplicate);
    }

    return closestIntersection;
};

export const run = async () => {
    console.log(timer.start('3'));
    console.log(await ans(input.wire1, input.wire2));
    console.log(timer.stop());
};

run();
