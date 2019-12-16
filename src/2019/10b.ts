import { getGridsFromFile, getMaxDetectableAsteroids, getAsteroidsAtSlope, IPoint, getSlope, toKey } from '~/2019/10';
import { timer } from '~/util/Timer';
import chalk from 'chalk';

// clockwise quadrant, top-left is Q1
export const getQuadrant = (origin: IPoint) => (point: IPoint) => {
    const dx = point.col - origin.col;
    const dy = point.row - origin.row;
    if (dy < 0 && dx >= 0)
        return 1;
    if (dy >= 0 && dx > 0)
        return 2;
    if (dy > 0 && dx <= 0)
        return 3;
    return 4;
};

export const shootAsteroids = (grid: string[][]) => {
    const { maxFrom: origin, slopesForMax: slopes } = getMaxDetectableAsteroids(grid);
    const asteroids = getAsteroidsAtSlope(grid, origin, slopes);
    const quadrant = getQuadrant(origin);
    const asteroidsSorted = asteroids.sort((a, b) => {
        const quadrantA = quadrant(a);
        const quadrantB = quadrant(b);
        if (quadrantA !== quadrantB)
            return quadrantA - quadrantB;

        const slopeA = getSlope(origin, a);
        const slopeB = getSlope(origin, b);
        return slopeA.row / slopeA.col - slopeB.row / slopeB.col;
    });
    return { origin, asteroidsSorted };
};

export const toStringQuadrantMapFromMax = (grid: string[][]) => {
    const {maxFrom: origin} = getMaxDetectableAsteroids(grid);
    const quadrant = getQuadrant(origin);
    const gridStr = grid.map((r, ri) => r.map((c, ci) => {
        const p = {col: ci, row: ri};
        if (toKey(origin) === toKey(p))
            return chalk.redBright.bold('X');
        if (c == '#')
            return chalk.cyanBright(quadrant(p).toString());
        return c;
    }).join(' ')).join('\n');
    return '\n' + gridStr + '\n';
};

export const toStringOrderedShot = (grid: string[][]) => {
    const {origin, asteroidsSorted} = shootAsteroids(grid);
    const maxDigits = asteroidsSorted.length.toString().length;
    const orderMap = new Map(asteroidsSorted.map<[string, number]>((a, i) => [toKey(a), i + 1]));
    const gridStr = grid.map((r, ri) => r.map((c, ci) => {
        const p = {col: ci, row: ri};
        if (toKey(origin) === toKey(p))
            return chalk.redBright.bold('X'.padStart(maxDigits, 'X'));
        if (orderMap.has(toKey(p)))
            return chalk.cyanBright(orderMap.get(toKey(p))!.toString().padStart(maxDigits, '0'));
        return c.padStart(maxDigits, c);
    }).join('  ')).join('\n');

    return '\n' + gridStr + '\n';
};

export const run = () => {
    const grids = getGridsFromFile();
    for (const {title, grid} of grids) {
        console.log(title);
        console.log(timer.start(`10b - ${title}`));
        console.log(toStringQuadrantMapFromMax(grid));
        console.log(toStringOrderedShot(grid));
        console.log(timer.stop());
    }

    const {asteroidsSorted} = shootAsteroids(grids.find(g => g.title === 'input')!.grid);
    console.log(`10b ans = ${JSON.stringify(asteroidsSorted[199])}`);
};

run();
