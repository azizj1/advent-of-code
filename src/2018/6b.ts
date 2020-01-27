import { declareProblem, declareSubproblem } from '~/util/util';
import { getSimulations, getBounds, makeIsInBounds } from '~/2018/6';
import { timer } from '~/util/Timer';
import { IPoint, toKey } from '~/2019/10';
import { Queue } from '~/util/Queue';
import { GenericSet } from '~/util/GenericSet';
import { getNeighbors } from '~/2019/18';

const getDistance = (from: IPoint, to: IPoint) =>
    Math.abs(from.col - to.col) + Math.abs(from.row - to.row);

const makeGetDistanceAll =
    (points: IPoint[]) =>
    (p: IPoint) =>
        points.reduce((a, c) => a + getDistance(p, c), 0);

const getCenter = (points: IPoint[]) => ({
    // avg betw all points is min distance - it's the center of all points
    row: Math.round(points.reduce((a, c) => a + c.row, 0) / points.length),
    col: Math.round(points.reduce((a, c) => a + c.col, 0) / points.length)
});

const getRegionClosestToAll = (maxDistance: number, points: IPoint[]) => {
    const starting = getCenter(points);
    const isInBounds = makeIsInBounds(getBounds(points));
    const getDistanceAll = makeGetDistanceAll(points);
    const queue = new Queue<IPoint>();
    const visited = new GenericSet<IPoint>(toKey);
    let regionSize = 0;

    queue.enqueue(starting);
    visited.add(starting);
    while (!queue.isEmpty()) {
        regionSize++;

        getNeighbors(queue.dequeue()!)
            .filter(isInBounds)
            .filter(p => !visited.has(p))
            .filter(p => getDistanceAll(p) < maxDistance)
            .forEach(n => {
                queue.enqueue(n);
                visited.add(n);
            });
    }
    return regionSize;
};

const getRegionClosestToAll2 = (maxDistance: number, points: IPoint[]) => {
    const isInBounds = makeIsInBounds(getBounds(points));
    const getDistanceAll = makeGetDistanceAll(points);
    const visited = new GenericSet<IPoint>(toKey);

    const helper = (p: IPoint): number => {
        if (visited.has(p))
            return 0;

        visited.add(p);
        return 1 + getNeighbors(p)
            .filter(isInBounds)
            .filter(n => !visited.has(n))
            .filter(n => getDistanceAll(n) < maxDistance)
            .map(helper)
            .reduce((a, c) => a + c, 0);
    };

    return helper(getCenter(points));
};

const runAg = (ag: (maxDistance: number, points: IPoint[]) => number, title: string) => {
    declareSubproblem(title);
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`name=${s.name}, coordinates=${s.coordinates.length}, maxDistance=${s.maxDistance}`));
        console.log(ag(s.maxDistance, s.coordinates));
        console.log(timer.stop());
    }
};

export const run = () => {
    declareProblem('6b');
    [{
        f: getRegionClosestToAll,
        n: 'BFS'
    }, {
        f: getRegionClosestToAll2,
        n: 'DFS'
    }].forEach(({f, n}) => runAg(f, n));
};
