import { timer } from '~/util/Timer';
import gridsFile from './10.txt';
import chalk from 'chalk';

interface IPoint {
    col: number;
    row: number;
}

interface IGrid {
    grid: string[][];
    title: string;
}

export const toKey = (point: IPoint) => `${point.col},${point.row}`;
export const fromKey = (key: string) => {
    const [col, row] = key.split(',').map(Number);
    return {col, row};
};

export const getgcd = (a: number, b: number): number => {
    const numerator = Math.max(a, b);
    const denominator = Math.min(a, b);
    const remainder = numerator % denominator;

    return remainder === 0 ? denominator : getgcd(denominator, remainder);
};

export const getSlope = (from: IPoint, to: IPoint): IPoint => {
    const dy = to.row - from.row;
    const dx = to.col - from.col;
    if (dx == 0)
        return {col: 0, row: to.row > from.row ? 1 : -1};
    else if (dy === 0)
        return {col: to.col > from.col ? 1 : -1, row: 0};
    const gcd = getgcd(Math.abs(dx), Math.abs(dy));
    return {col: Math.floor(dx / gcd), row: Math.floor(dy / gcd)};
};

export const getAsteroids = (grid: string[][]) => {
    const asteroids: IPoint[] = [];

    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++)
            if (grid[i][j] === '#')
                asteroids.push({col: j, row: i});

    return asteroids;
};

export const getDetectableAsteroids = (from: IPoint, asteroids: IPoint[]) => {
    const slopes = new Set<string>();
    const fromKey = toKey(from);
    for (let i = 0; i < asteroids.length; i++) {
        if (fromKey !== toKey(asteroids[i]))
            slopes.add(toKey(getSlope(from, asteroids[i])));
    }
    return slopes;
};

export const getMaxDetectableAsteroids = (grid: string[][]) => {
    const asteroids = getAsteroids(grid);
    let maxDetectableAsteroids = 0;
    let slopesForMax = new Set<string>();
    let maxFrom: IPoint = {col: -1, row: -1};

    for (let i = 0; i < asteroids.length; i++) {
        const detectableAsteroids = getDetectableAsteroids(asteroids[i], asteroids);
        if (detectableAsteroids.size > maxDetectableAsteroids) {
            maxDetectableAsteroids = detectableAsteroids.size;
            slopesForMax = detectableAsteroids;
            maxFrom = asteroids[i];
        }
    }

    return {maxDetectableAsteroids, slopesForMax, maxFrom};
};

export const add = (p1: IPoint) => (p2: IPoint) => ({col: p1.col + p2.col, row: p1.row + p2.row});
export const getAsteroidsAtSlope = (grid: string[][], from: IPoint, slopeKeys: Set<string>) =>
    Array.from(slopeKeys.values())
    .map(fromKey)
    .map(add(from))
    .map(p => {
        const slope = {col: p.col - from.col, row: p.row - from.row};
        let p1 = p;
        while (grid[p1.row][p1.col] !== '#')
            p1 = add(p1)(slope);
        return p1;
    });

export const toString = (grid: string[][], start: IPoint, highlight: IPoint[]) => {
    const set = new Set(highlight.map(toKey));
    grid[start.row][start.col] = chalk.redBright.bold('X');
    const gridStr = grid.map((r, ri) => r.map((c, ci) => {
        if (c == '#') {
            if (set.has(toKey({col: ci, row: ri})))
                return chalk.cyanBright.bold('#');
            return '#';
        }
        return c;
    }).join(' ')).join('\n');
    return '\n' + gridStr + '\n';
};

export const getGridsFromFile = () => {
    const grids: IGrid[] = [];
    const matches = gridsFile.matchAll(/\[([^\]]+)\]\r?\n?((?:[.#]+\r?\n?)+)/ig);
    for (const match of matches)
        grids.push({
            title: match[1],
            grid: match[2].match(/[.#]+/ig)?.map(r => r.split('')) ?? []
        });
    return grids;
};

export const run = () => {
    const grids = getGridsFromFile();
    for (const grid of grids) {
        const result = getMaxDetectableAsteroids(grid.grid);
        const asteroids = getAsteroidsAtSlope(grid.grid, result.maxFrom, result.slopesForMax);
        console.log(timer.start(`10a - ${grid.title}`));
        console.log(toString(grid.grid, result.maxFrom, asteroids));
        console.log(`max detectable asteroids = ${result.maxDetectableAsteroids}`);
        console.log(timer.stop());
    }
};

run();
