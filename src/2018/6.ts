import input from './6.txt';
import { getRunsFromIniNewlineSep, first, last, declareProblem } from '~/util/util';
import { IPoint, toKey } from '~/2019/10';
import { Queue } from '~/util/Queue';
import { getNeighbors } from '~/2019/18';
import { timer } from '~/util/Timer';

export interface INamedPoint extends IPoint {
    name: string;
}

interface IBound {
    colBounds: readonly [number, number];
    rowBounds: readonly [number, number];
}

const getName = (i: number) => String.fromCharCode('A'.charCodeAt(0) + Math.trunc(i / 26), 'A'.charCodeAt(0) + i % 26);

export const getSimulations = () => getRunsFromIniNewlineSep(input).map(ini => ({
    name: ini.name,
    coordinates: ini.content.map((c, i) => {
        const [x, y] = c.split(', ').map(Number);
        return {
            name: getName(i),
            row: y,
            col: x
        } as INamedPoint;
    })
}));

const getBounds = (points: IPoint[]): IBound => {
    const cloned = [...points];
    cloned.sort((a, b) => a.col - b.col);
    const colBounds = [first(cloned).col, last(cloned).col] as const;

    cloned.sort((a, b) => a.row - b.row);
    const rowBounds = [first(cloned).row, last(cloned).row] as const;

    return { colBounds, rowBounds };
};

const makeIsInBounds = (bounds: IBound) => (p: IPoint) => {
    const { row, col } = p;
    const { rowBounds: [minR, maxR], colBounds: [minC, maxC] } = bounds;
    if (row < minR || row > maxR || col < minC || col > maxC)
        return false;
    return true;
};

const excludedName = '.';

const getFiniteAreas = (points: INamedPoint[]) => {
    const queue = new Queue<INamedPoint & {distance: number}>();
    const visited = new Map<string, {name: string; distance: number}>(); // point -> name&distance
    const isInBounds = makeIsInBounds(getBounds(points));
    const areaPerCoordinate = new Map<string, number>(points.map(p => [p.name, 0]));
    const hasInfiniteArea = new Set<string>();

    points.forEach(p => queue.enqueue({...p, distance: 0}));

    while (!queue.isEmpty()) {
        const { distance, name, ...p } = queue.dequeue()!;
        const pointStr = toKey(p);

        if (!visited.has(pointStr)) {
            visited.set(pointStr, {name, distance});
            areaPerCoordinate.set(name, (areaPerCoordinate.get(name) ?? 0) + 1);
        }
        else {
            const {
                name: contenderName, distance: contenderDistance
            } = visited.get(pointStr)!;
            if (contenderDistance < distance || contenderName === excludedName || contenderName === name)
                continue;
            // if both are equidistance, put a '.' on the spot, and subtract that point
            // from the name currently on it
            else if (contenderDistance === distance) {
                visited.set(pointStr, {name: excludedName, distance});
                areaPerCoordinate.set(contenderName, areaPerCoordinate.get(contenderName)! - 1);
                continue;
            }
        }

        let neighbors = getNeighbors(p);
        if (!neighbors.every(isInBounds))
            hasInfiniteArea.add(name);

        neighbors = neighbors.filter(isInBounds).filter(p => !visited.has(toKey(p)));
        for (const neighbor of neighbors)
            queue.enqueue({...neighbor, name, distance: distance + 1});
    }

    return new Map(Array.from(areaPerCoordinate.entries()).filter(e => !hasInfiniteArea.has(e[0])));
};

const getLargestFiniteArea = (map: Map<string, number>) => Math.max(...Array.from(map.values()));

export const run = () => {
    declareProblem('6a');
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`name=${s.name}, coordinates=${s.coordinates.length}`));
        const finiteAreas = getFiniteAreas(s.coordinates);
        console.log(finiteAreas);
        console.log(getLargestFiniteArea(finiteAreas));
        console.log(timer.stop());
    }
};
