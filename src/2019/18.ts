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
    const result: {toKey: string; steps: number; doorsInWay: GenericSet<string>}[] = [];
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
                result.push({toKey: neighbor.key, steps: distance + 1, doorsInWay: new GenericSet(doorsInWay)});
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

export const getDoorsNeededUnlockedMap = (
    keyToKeySteps: Map<string, {toKey: string; steps: GenericSet<IPoint>}[]>,
    doors: Map<string, IPoint>
) => {
    const blocks = {} as {[fromKey: string]: {[toKey: string]: Set<string>}};

    for (const fromKey of keyToKeySteps.keys()) {
        blocks[fromKey] = {};
        for (const toKey of keyToKeySteps.keys()) {
            blocks[fromKey][toKey] = new Set();
        }
    }

    for (const fromKey of keyToKeySteps.keys()) {
        for (const {toKey, steps} of keyToKeySteps.get(fromKey)!) {
            for (const [door, point] of doors.entries()) {
                if (steps.has(point))
                    blocks[fromKey][toKey].add(door);
            }
        }
    }
    return blocks;
};

export const solve = (keyToKeyMap: Map<string, {toKey: string; steps: number; doorsInWay: GenericSet<string>}[]>) => {

    const getReachableKeys = (fromKey: string, keysObtained: GenericSet<string>) =>
        keyToKeyMap.get(fromKey)
            ?.filter(k => !keysObtained.has(k.toKey))
            ?.filter(k => k.doorsInWay.subsetOf(keysObtained)) ?? [];

    const getCacheKey = (fromKey: string, keysObtained: string) => `${fromKey},${[...keysObtained].sort().toString()}`;

    const helper = (fromKey: string, keysObtained: string, cache: {[key: string]: number}): number => {
        if (keysObtained.length === keyToKeyMap.size - 1) // minus 1 because @ is in keysToKeysSteps
            return 0;
        const cacheKey = getCacheKey(fromKey, keysObtained);
        if (cache[cacheKey] != null)
            return cache[cacheKey];
        // reachableKey either isn't blocked by any door, or if it is blocked by N doors,
        // all their respective keys are obtained
        const reachableKeys = getReachableKeys(fromKey, new GenericSet(k => k.toUpperCase(), [...keysObtained]));
        let totalSteps = Infinity;
        for (const reachableKey of reachableKeys) {
            const steps =
                reachableKey.steps +
                Math.min(totalSteps, helper(reachableKey.toKey, keysObtained + reachableKey.toKey, cache));
            totalSteps = Math.min(totalSteps, steps);
        }
        cache[cacheKey] = totalSteps;
        return totalSteps;
    };

    return helper('@', '', {});
};

export const run = () => {
    const sims = getSimulations().slice(0, 6);
    for (const s of sims) {
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
        const d = getNearestKeysMap2(s);
        console.log(d.get('@')?.map(a => `${a.toKey}: ${a.steps}`).join('   '));
        console.log(solve(d));
        console.log(timer.stop());
    }
};
