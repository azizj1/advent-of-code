import { getRunsFromIniFile } from '~/util/util';
import input from './18.txt';
import { IPoint, toKey as toString } from '~/2019/10';
import { timer } from '~/util/Timer';
import { PriorityQueue } from '~/util/PriorityQueue';
import { GenericSet } from '~/util/GenericSet';

export interface IBaseTunnel {
    name: string;
    grid: string[][];
    keys: Map<string, IPoint>;
    doors: Map<string, IPoint>;
}

interface ITunnel extends IBaseTunnel {
    entrance: IPoint;
}

interface IPriorityQueueState {
    point: IPoint;
    distance: number;
    keysObtained: GenericSet<string>;
    doorsInWay: GenericSet<string>;
}

export interface IKeyToKeyInfo {
    toKey: string;
    steps: number;
    doorsInWay: GenericSet<string>;
    keysInWay: GenericSet<string>;
}

export const toTunnel = ({name, grid}: {name: string; grid: string[][]}): ITunnel => {
    const keys = new Map<string, IPoint>();
    const doors = new Map<string, IPoint>();
    let entrance: IPoint | null = null;
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++) {
            const p = {row: i, col: j};
            if (/^[a-z]$/.test(grid[i][j]))
                keys.set(grid[i][j], p);
            else if (/^[A-Z]$/.test(grid[i][j]))
                doors.set(grid[i][j], p);
            else if (grid[i][j] === '@')
                entrance = p;
        }
    return {
        name,
        grid,
        keys,
        doors,
        entrance: entrance!
    };
};

const getSimulations = () => getRunsFromIniFile(input)
    .map(s => ({
        name: s.name,
        grid: s.content.split(/\r?\n/).filter(s => s.trim() !== '').map(r => r.split(''))
    }))
    .map(toTunnel);

export const equals = (p1?: IPoint, p2?: IPoint) => p1 != null && p2 != null ?
    p1.col === p2.col && p1.row === p2.row :
    false;

export const getNeighbors = ({row, col}: IPoint, exclude?: IPoint | null): IPoint[] =>
    exclude == null ?
        [{row: row - 1, col}, {row: row + 1, col}, {row, col: col + 1}, {row, col: col - 1}] :
        getNeighbors({row, col}, null).filter(p => p.row !== exclude.row || p.col !== exclude.col);

export const makeIsValid = ({grid, keys, doors}: IBaseTunnel) => (visited: GenericSet<IPoint>) => (p: IPoint) => {
    const cell = grid[p.row][p.col];
    if (cell == null ||
        visited.has(p) ||
        cell !== '.' &&
        cell !== '@' &&
        !equals(keys.get(cell), p) && // stepping on a key is valid
        !equals(doors.get(cell), p) // stepping on a door is valid. We don't care about doors right now
    )
        return false;
    return true;
};

export const makeAddPointInfo = ({grid, keys, doors}: IBaseTunnel) => (p: IPoint) => {
    const cell = grid[p.row][p.col];
    return {
        point: p,
        key: equals(p, keys.get(cell)) ? cell : null,
        door: equals(p, doors.get(cell)) ? cell : null
    };
};

// will return all short AND LONG paths fromKey to toKey
export const getDistancesToAllKeys = (from: IPoint, tunnel: IBaseTunnel) => {
    const queue = new PriorityQueue<IPriorityQueueState>(p => -1 * p.distance);
    const visited = new GenericSet<IPoint>(toString);
    const result: IKeyToKeyInfo[] = [];
    const isValid = makeIsValid(tunnel)(visited);
    const addPointInfo = makeAddPointInfo(tunnel);

    visited.add(from);
    queue.enqueue({
        point: from,
        distance: 0,
        keysObtained: new GenericSet(s => s),
        doorsInWay: new GenericSet(s => s)
    });

    while (!queue.isEmpty()) {
        const {point, distance, keysObtained, doorsInWay} = queue.dequeue()!;
        const neighbors = getNeighbors(point)
            .filter(isValid)
            .map(addPointInfo);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            const newKeysObtained = i === neighbors.length - 1 ? keysObtained : new GenericSet(keysObtained);
            const newDoorsInWay = i === neighbors.length - 1 ? doorsInWay : new GenericSet(doorsInWay);
            if (neighbor.door != null)
                newDoorsInWay.add(neighbor.door);
            if (neighbor.key != null)
                newKeysObtained.add(neighbor.key);

            visited.add(neighbor.point);
            queue.enqueue({
                point: neighbor.point,
                distance: distance + 1,
                keysObtained: newKeysObtained,
                doorsInWay: newDoorsInWay
            });

            if (neighbor.key != null) {
                const keysInWay = new GenericSet(keysObtained);
                keysInWay.delete(neighbor.key); // don't include toKey in keysInWay
                result.push({
                    toKey: neighbor.key,
                    steps: distance + 1,
                    doorsInWay: new GenericSet(doorsInWay),
                    keysInWay
                });
            }
        }
    }
    return result;
};

export const getNearestKeysMap = (tunnel: ITunnel) => {
    const { keys, entrance } = tunnel;
    return new Map(Array.from(keys.entries())
        .map(([k, p]) => [k, getDistancesToAllKeys(p, tunnel)])
    ).set('@', getDistancesToAllKeys(entrance, tunnel));
};

export const makeGetReachableKeys =
    (keyToKeyMap: Map<string, IKeyToKeyInfo[]>) =>
    (fromKey: string, keysObtained: GenericSet<string>) =>
        keyToKeyMap.get(fromKey)
            ?.filter(k => !keysObtained.has(k.toKey))
            ?.filter(k => k.doorsInWay.subsetOf(keysObtained, k => k.toString().toLowerCase()))
            ?.filter(k => k.keysInWay.subsetOf(keysObtained)) ?? [];
            // if you skip over keysInWay, you'e looking at a suboptiaml route because you'll examine routes
            // like a -> c, when there is key b between a -> c

export const getCacheKey = (fromKey: string, keysObtained: string) =>
    `${fromKey},${[...keysObtained].sort().toString()}`;

export const solve = (keyToKeyMap: Map<string, IKeyToKeyInfo[]>) => {
    const getReachableKeys = makeGetReachableKeys(keyToKeyMap);
    const cache: {[key: string]: number} = {};

    const helper = (fromKey: string, keysObtained: string): number => {
        if (keysObtained.length === keyToKeyMap.size - 1) {
            return 0;
        } // minus 1 because @ is in keysToKeysSteps
        const cacheKey = getCacheKey(fromKey, keysObtained);
        if (cache[cacheKey] != null)
            return cache[cacheKey];
        // has to be uppercased so it can be compared against doors
        const reachableKeys = getReachableKeys(fromKey, new GenericSet(k => k, [...keysObtained]));
        let totalSteps = Infinity;
        for (const reachableKey of reachableKeys) {
            const steps =
                reachableKey.steps +
                Math.min(totalSteps, helper(reachableKey.toKey, keysObtained + reachableKey.toKey));
            totalSteps = Math.min(totalSteps, steps);
        }
        cache[cacheKey] = totalSteps;
        return totalSteps;
    };

    return helper('@', '');
};

export const solve2 = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>) => {
    type QueueState = {totalSteps: number; keysObtained: string; atKey: string};
    // const queue = new Queue<QueueState>(); FOR BFS
    const queue = new PriorityQueue<QueueState>(p => -1 * p.totalSteps);
    const visited = new Map<string, number>();
    const getReachableKeys = makeGetReachableKeys(keytoKeyMap);
    let minSteps = Infinity;

    queue.enqueue({totalSteps: 0, keysObtained: '', atKey: '@'});
    while (!queue.isEmpty()) {
        const { totalSteps, keysObtained, atKey } = queue.dequeue()!;
        if (keysObtained.length === keytoKeyMap.size - 1) {
            minSteps = Math.min(totalSteps, minSteps);
            return minSteps; // for BFS, remove this line.
        }

        const reachableKeys = getReachableKeys(atKey, new GenericSet(k => k, [...keysObtained]));
        for (const key of reachableKeys) {
            const newKeysObtained = keysObtained + key.toKey;
            const newCacheKey = getCacheKey(key.toKey, newKeysObtained);
            const newTotalSteps = totalSteps + key.steps;
            // the visited.get(newCacheKey)! > newTotalSteps is crucial, because you may find a later route that has
            // fewer steps
            if (!visited.has(newCacheKey) || visited.get(newCacheKey)! > newTotalSteps) {
                queue.enqueue({
                    totalSteps: newTotalSteps,
                    atKey: key.toKey,
                    keysObtained: newKeysObtained
                });
                visited.set(newCacheKey, newTotalSteps);
            }
        }
    }
    return minSteps;
};

export const run = () => {
    console.log('STARTING');
    const sims = getSimulations().slice(1, 2);
    for (const s of sims) {
        const d = getNearestKeysMap(s);
        console.log(timer.start(`18 - ${s.name}, ${s.keys.size} keys, ${s.doors.size} doors`));
        console.log(s.grid.map(r => r.join(' ')).join('\n'));
        console.log('answer (DIJ) =', solve2(d));
        console.log('answer (DFS) =', solve(d));
        console.log(timer.stop());
    }
};
