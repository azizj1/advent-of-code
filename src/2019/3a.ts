import { timer } from '~/util/Timer';
import * as input from './3.json';

export interface IPoint {
    x: number;
    y: number;
}

export const populate = (grid: number[][], starting: IPoint, displacement: string, considerDupes = false) => {
    const direction = displacement[0];
    const distance = Number(displacement.slice(1));
    const { x, y } = starting;
    let newStarting = starting;
    let closestDuplicate = 1_000_000_000;
    const getMDistance = (xn: number, yn: number) => Math.abs(xn) + Math.abs(yn);
    const updateDupe = (xn: number, yn: number) => {
        closestDuplicate = Math.min(closestDuplicate, getMDistance(xn, yn));
    };
    const increment = (xn: number, yn: number) => {
        if (grid[yn] == null)
            grid[yn] = [];
        grid[yn][xn] = (grid[yn][xn] ?? 0) + 1;

        if (grid[yn][xn] > 1 && considerDupes)
            updateDupe(xn, yn);
    };

    switch (direction) {
        case 'R': {
            newStarting = { x: x + distance, y };
            for (let i = 1; i <= distance; i++)
                increment(x + i, y);
            break;
        }
        case 'D': {
            newStarting = { x, y: y + distance };
            for (let i = 1; i <= distance; i++)
                increment(x, y + i);
            break;
        }
        case 'L': {
            newStarting = { x: x - distance, y };
            for (let i = 1; i <= distance; i++)
                increment(x - i, y);
            break;
        }
        case 'U': {
            newStarting = { x, y: y - distance };
            for (let i = 1; i <= distance; i++)
                increment(x, y - i);
            break;
        }
    }
    return {newStarting, closestDuplicate};
};

export const toString = (grid: (number | null)[][]) => {
    const x = grid.map(r => r?.reduce((a, c) => Math.max(a ?? 0, c ?? 0), 0)).filter(r => r != null) as number[];
    const maxDigits = Math.max(...x).toString().length;
    const pad = (n: number | null) => n?.toString().padStart(maxDigits, '0') ?? ''.padStart(maxDigits, ' ');
    return grid.map(r => r.map(pad).join('  ')).join('\n') + '\n';
};

export const ans = (wire1: string[], wire2: string[]) => {
    let starting = {x: 0, y: 0};
    let closestIntersection = 1_000_000_000_000;

    const grid: number[][] = [];
    grid[0] = [];
    grid[0][0] = 0;

    for (const c1 of wire1) {
        const result = populate(grid, starting, c1);
        starting = result.newStarting;
        closestIntersection = Math.min(closestIntersection, result.closestDuplicate);
    }

    starting = {x: 0, y: 0};
    for (const c2 of wire2) {
        const result = populate(grid, starting, c2, true);
        starting = result.newStarting;
        closestIntersection = Math.min(closestIntersection, result.closestDuplicate);
    }
    return closestIntersection;
};

export const run = () => {
    console.log(timer.start('3'));
    console.log(ans(input.wire1, input.wire2));
    console.log(timer.stop());
};

run();
