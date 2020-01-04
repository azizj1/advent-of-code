import { getRunsFromIniFile } from '~/util/util';
import input from './18.txt';
import { IPoint, toKey as toString } from '~/2019/10';
import { timer } from '~/util/Timer';
import { PriorityQueue } from '~/util/PriorityQueue';
import { GenericSet } from '~/util/GenericSet';

interface ITunnel {
    name: string;
    grid: string[][];
    keys: Map<string, IPoint>;
    doors: Map<string, IPoint>;
    entrance: IPoint;
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

export const getSimulations = () => getRunsFromIniFile(input)
    .map(s => ({
        name: s.name,
        grid: s.content.split(/\r?\n/).filter(s => s.trim() !== '').map(r => r.split(''))
    }))
    .map(toTunnel);

export const equals = (p1?: IPoint, p2?: IPoint) => p1 != null && p2 != null ?
    p1.col === p2.col && p1.row === p2.row :
    false;

const getNeighbors = ({row, col}: IPoint, exclude?: IPoint | null): IPoint[] =>
    exclude == null ?
        [{row: row - 1, col}, {row: row + 1, col}, {row, col: col + 1}, {row, col: col - 1}] :
        getNeighbors({row, col}, null).filter(p => p.row !== exclude.row || p.col !== exclude.col);

export const collectKeys = ({grid, keys, entrance}: ITunnel) => {
    const get = ({row, col}: IPoint) => grid[row][col];
    const isValid = (p: IPoint, visited: Set<string>, keysObtained: Set<string>) => {
        const cell = get(p);
        const pHash = toString(p);
        if (cell == null ||
            cell !== '.' &&
            cell !== '@' &&
            toString(keys.get(cell)) !== pHash && // stepping on a key is valid
            !keysObtained.has(cell.toLowerCase()) && // stepping on A if 'a' is obtained is valid
            !visited.has(pHash)
        )
            return false;
        return true;
    };

    const helper = (start: IPoint, from: IPoint | null, visited: Set<string>, keysObtained: Set<string>): number => {
        if (!isValid(start, visited, keysObtained))
            return Infinity;

        // if (from != null && from.col === entrance.col && from.row === entrance.row && keysObtained.size === 0) {
        //     console.log('STARTING OVER');
        // }
        const cell = get(start);
        let onKey = false;

        visited.add(toString(start));
        if (keys.has(cell) && !keysObtained.has(cell)) {
            keysObtained.add(cell);
            console.log('OBTAINED KEY: ', cell, '\n\tRemaining: ', Array.from(keys.keys()).filter(k => !keysObtained.has(k)));
            onKey = true;
            if (keysObtained.size === keys.size)
                return 0;
        }

        // if currently stepping on key, you're allowed to go back
        const neighbors = getNeighbors(start, onKey ? null : from);
        const steps: number[] = [];
        for (const neighbor of neighbors)
            steps.push(helper(neighbor, start, onKey ? new Set() : visited, new Set(keysObtained)));

        // console.log('backtracking at ', toKey(start));
        return 1 + Math.min(...steps);
    };

    return helper(entrance, null, new Set(), new Set());
};

export const getNearestKeysMap = ({grid, keys, doors, entrance}: ITunnel) => {
    const result = new Map<string, {toKey: string; steps: GenericSet<IPoint>}[]>();
    const cache: {[toKey: string]: {[fromPoint: string]: IPoint[]}} = {}; // cache[toKey][fromPoint] = steps;
    for (const k of keys.keys()) {
        cache[k] = {};
        result.set(k, []);
    }
    result.set('@', []); // need to add this for entrance

    const get = ({row, col}: IPoint) => grid[row][col];
    const isValid = (p: IPoint, visited: GenericSet<IPoint>) => {
        const cell = get(p);
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
    const helper = (start: IPoint, visited: GenericSet<IPoint>, toKey: string): IPoint[] | null => {
        if (!isValid(start, visited))
            return null;
        // console.log('at', start, 'looking for', toKey);
        const cell = get(start);
        const pointStr = toString(start);
        if (cache[toKey][pointStr] != null) {
            // console.log('HIT CACHE! from:', start, 'to:', toKey, 'steps:', cache[toKey][pointStr]);
            return cache[toKey][pointStr];
        }
        if (cell === toKey)
            return [];

        visited.add(start);
        const neighbors = getNeighbors(start).filter(n => !visited.has(n));
        const allSteps: IPoint[][] = [];
        for (const neighbor of neighbors) {
            const steps = helper(neighbor, visited, toKey);
            if (steps != null)
                allSteps.push(steps);
        }

        if (allSteps.length === 0)
            return null;

        const minSteps = allSteps.sort((a, b) => a.length - b.length)[0];
        minSteps.unshift(start);
        // cache[toKey][pointStr] = minSteps;
        // console.log('put', cache[toKey][pointStr], 'into cache for toKey =', toKey, 'point =', pointStr);
        return minSteps;
    };

    for (const k of keys.keys()) {
        const steps = helper(entrance, new GenericSet<IPoint>(toString), k);
        if (steps != null)
            result.get('@')!.push({
                toKey: k,
                steps: new GenericSet(toString, steps)
            });
    }

    for (const fromKey of keys.keys())
        for (const toKey of keys.keys()) {
            if (fromKey === toKey)
                continue;
            const steps = helper(keys.get(fromKey)!, new GenericSet<IPoint>(toString), toKey);
            if (steps == null)
                continue;
            // if fromKey to toKey is 5 steps, then toKey to fromKey is 5 steps.
            cache[toKey][toString(keys.get(fromKey))] = [...steps];
            cache[fromKey][toString(keys.get(toKey))] = [...steps].reverse();
            result.get(fromKey)!.push({
                toKey,
                steps: new GenericSet(toString, [...steps])
            });
        }
    return result;
};

interface IPriorityQueueState {
    point: IPoint;
    distance: number;
    keysObtained: GenericSet<string>;
    doorsInWay: GenericSet<string>;
}

export const makeIsValid = ({grid, keys, doors}: ITunnel) => (visited: GenericSet<IPoint>) => (p: IPoint) => {
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

export const makeAddPointInfo = ({grid, keys, doors}: ITunnel) => (p: IPoint) => {
    const cell = grid[p.row][p.col];
    return {
        point: p,
        key: equals(p, keys.get(cell)) ? cell : null,
        door: equals(p, doors.get(cell)) ? cell : null
    };
};

// will return all short and long paths fromKey to toKey
export const getDistancesToAllKeys = (from: IPoint, tunnel: ITunnel) => {
    const queue = new PriorityQueue<IPriorityQueueState>(p => -1 * p.distance);
    const visited = new GenericSet<IPoint>(toString);
    const result: {toKey: string; steps: number; doorsInWay: GenericSet<string>; keysInWay: GenericSet<string>}[] = [];
    const isValid = makeIsValid(tunnel)(visited);
    const addPointInfo = makeAddPointInfo(tunnel);

    queue.insert({point: from, distance: 0, keysObtained: new GenericSet(s => s), doorsInWay: new GenericSet(s => s)});
    visited.add(from);

    while (!queue.isEmpty()) {
        const {point, distance, keysObtained, doorsInWay} = queue.poll()!;
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

            queue.insert({
                point: neighbor.point,
                distance: distance + 1,
                keysObtained: newKeysObtained,
                doorsInWay: newDoorsInWay
            });
            visited.add(neighbor.point);
            if (neighbor.key != null) {
                const keysInWay = new GenericSet(keysObtained);
                keysInWay.delete(neighbor.key);
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

export const getNearestKeysMap2 = (tunnel: ITunnel) => {
    const { keys, entrance } = tunnel;
    return new Map(Array.from(keys.entries())
        .map(([k, p]) => [k, getDistancesToAllKeys(p, tunnel)])
    ).set('@', getDistancesToAllKeys(entrance, tunnel));
};

type KeyToKeyMap = Map<
    string,
    {toKey: string; steps: number; doorsInWay: GenericSet<string>; keysInWay: GenericSet<string>}[]
>;

export const makeGetReachableKeys =
    (keyToKeyMap: KeyToKeyMap) =>
    (fromKey: string, keysObtained: GenericSet<string>) =>
        keyToKeyMap.get(fromKey)
            ?.filter(k => !keysObtained.has(k.toKey))
            ?.filter(k => k.doorsInWay.subsetOf(keysObtained, k => k.toString().toLowerCase()))
            ?.filter(k => k.keysInWay.subsetOf(keysObtained)) ?? [];
            // if you skip over keysInWay, you'e looking at a suboptiaml route

export const solve = (keyToKeyMap: KeyToKeyMap) => {
    const getReachableKeys = makeGetReachableKeys(keyToKeyMap);
    const getCacheKey = (fromKey: string, keysObtained: string) => `${fromKey},${[...keysObtained].sort().toString()}`;
    const cache: {[key: string]: number} = {};

    let count = 0;
    const helper = (fromKey: string, keysObtained: string): number => {
        if (keysObtained.length === keyToKeyMap.size - 1) {
            // console.log('count', count);
            return 0;
        } // minus 1 because @ is in keysToKeysSteps
        const cacheKey = getCacheKey(fromKey, keysObtained);
        if (cache[cacheKey] != null)
            return cache[cacheKey];
        count++;
        console.log('atKey:', fromKey, 'keysObtained', keysObtained);
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

    const x = helper('@', '');
    console.log('count', count);
    return x;
};

const getCacheKey = (fromKey: string, keysObtained: string) => `${fromKey},${[...keysObtained].sort().toString()}`;

export const solve2 = (keytoKeyMap: KeyToKeyMap) => {
    type QueueState = {totalSteps: number; keysObtained: string; atKey: string};
    const queue = new PriorityQueue<QueueState>(p => -1 * (p.totalSteps + 0));
    const visited = new Map<string, number>();
    const getReachableKeys = makeGetReachableKeys(keytoKeyMap);
    let count = 0;
    let minSteps = Infinity;
    queue.insert({totalSteps: 0, keysObtained: '', atKey: '@'});
    while (!queue.isEmpty()) {
        count++;
        const { totalSteps, keysObtained, atKey } = queue.poll()!;
        // console.log('atKey:', atKey, 'keysObtained', keysObtained, 'totalSteps:', totalSteps, 'queueSize', queue.size());
        if (keysObtained.length === keytoKeyMap.size - 1) {
            // console.log('count', count, 'queueSize', queue.size());
            minSteps = Math.min(totalSteps, minSteps);
        }

        const reachableKeys = getReachableKeys(atKey, new GenericSet(k => k, [...keysObtained]));
        // console.log(`\treachable=${reachableKeys.map(k => k.toKey)}`);

        for (const key of reachableKeys) {
            const newKeysObtained = keysObtained + key.toKey;
            const newCacheKey = getCacheKey(key.toKey, newKeysObtained);
            const newTotalSteps = totalSteps + key.steps;
            if (!visited.has(newCacheKey) || visited.get(newCacheKey)! > newTotalSteps) {
                queue.insert({
                    totalSteps: totalSteps + key.steps,
                    atKey: key.toKey,
                    keysObtained: newKeysObtained
                });
                visited.set(newCacheKey, newTotalSteps);
            }
        }
    }
    console.log('iterations =', count);
    return minSteps;
};

export const run = () => {
    console.log('STARTING');
    const sims = getSimulations();
    for (const s of sims) {
        const d = getNearestKeysMap2(s);

        console.log(timer.start(`18 - ${s.name}, ${s.keys.size} keys, ${s.doors.size} doors`));
        // console.log(s.grid.map(r => r.join(' ')).join('\n'));
        // const keysToKeys = getNearestKeysMap(s);
        // const simpleKeysToKeys = new Map(
        //     Array.from(keysToKeys.entries())
        //     .map(([k, s]) => [
        //         k,
        //         s.map(v => ({toKey: v.toKey, steps: v.steps.size}))
        //     ]));
        // console.log(simpleKeysToKeys.get('@')?.sort((a, b) => a.steps - b.steps).map(a => `${a.toKey}: ${a.steps}`).join('   '));
        // console.log(solve(simpleKeysToKeys, getDoorsNeededUnlockedMap(keysToKeys, s.doors)));
        // Array.from(d.keys()).forEach(k =>
        //     console.log(`key=${k}\t`, d.get(k)?.map(a => `${a.toKey}: ${a.steps} (${Array.from(a.keysInWay.values()).concat(Array.from(a.doorsInWay.values()))})`).join('   '))
        // );
        // console.log(d.get('@')?.map(a => `${a.toKey}: ${a.steps} (${Array.from(a.keysInWay.values())})`).join('   '));
        console.log('answer =', solve2(d));
        // console.log(solve2(d));
        console.log(timer.stop());
    }
};
