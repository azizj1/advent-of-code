import { IPoint } from '~/2019/10';
import { getDistancesToAllKeys, IBaseTunnel, IKeyToKeyInfo, makeGetReachableKeys, getCacheKey } from '~/2019/18';
import { getRunsFromIniFile, resetConsoleInfo, dropConsoleInfo } from '~/util/util';
import input from './18b.txt';
import { timer } from '~/util/Timer';
import { PriorityQueue } from '~/util/PriorityQueue';
import { GenericSet } from '~/util/GenericSet';
import chalk from 'chalk';

interface ITunnel extends IBaseTunnel {
    entrances: Map<string, IPoint>;
}

export const toTunnel = ({name, grid}: {name: string; grid: string[][]}): ITunnel => {
    const keys = new Map<string, IPoint>();
    const doors = new Map<string, IPoint>();
    const entrances = new Map<string, IPoint>();
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++) {
            const p = {row: i, col: j};
            if (/^[a-z]$/.test(grid[i][j]))
                keys.set(grid[i][j], p);
            else if (/^[A-Z]$/.test(grid[i][j]))
                doors.set(grid[i][j], p);
            else if (grid[i][j] === '@')
                entrances.set(entrances.size === 0 ? '@' : `@${entrances.size}`, p);
        }
    return {
        name,
        grid,
        keys,
        doors,
        entrances
    };
};

export const getSimulations = () => getRunsFromIniFile(input)
    .map(s => ({
        name: s.name,
        grid: s.content.split(/\r?\n/).filter(s => s.trim() !== '').map(r => r.split(''))
    }))
    .map(toTunnel);

const getNearestKeysMap = (tunnel: ITunnel) => {
    const { keys, entrances } = tunnel;
    const distancesFromKeys =
        Array.from(keys.entries()).map(([k, p]) => [k, getDistancesToAllKeys(p, tunnel)]);
    const distancesFromEntrances =
        Array.from(entrances.entries()).map(([k, p]) => [k, getDistancesToAllKeys(p, tunnel)]);
    return new Map(distancesFromKeys.concat(distancesFromEntrances) as [string, IKeyToKeyInfo[]][]);
};

const getKeyToEntranceMap = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>, entrances: Map<string, IPoint>) => {
    const keyToEntranceMap = new Map<string, string>(); // key to entrance it belongs to
    for (const e of entrances.keys()) {
        keyToEntranceMap.set(e, e);
        for (const k of keytoKeyMap.get(e)!)
            keyToEntranceMap.set(k.toKey, e);
    }
    return keyToEntranceMap;
};

const getAllValuesExcludingKey = (keyToExclude: string, allKeys: Map<string, string>) => {
    let values = '';
    for (const k of allKeys.keys())
        if (k !== keyToExclude)
        values += allKeys.get(k);
    return values;
};

export const lowerBound = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>, entrances: Map<string, IPoint>) => {
    type QueueState = {totalSteps: number; keysObtained: string; atKey: string};
    const queue = new PriorityQueue<QueueState>(p => -1 * p.totalSteps);
    const visited = new Map<string, number>();
    const getReachableKeys = makeGetReachableKeys(keytoKeyMap);
    const keyToQuadrantMap = getKeyToEntranceMap(keytoKeyMap, entrances); // The entrance a key belongs to
    // all the keys that will be obtained in a quadrant.
    const allKeysInQuadrant = new Map(Array.from(entrances.keys()).map(k => [
        k, // key of the Map
        keytoKeyMap.get(k)!.map(k1 => k1.toKey).join('')
    ]));
    const keysPerQuadrant = new Map(Array.from(entrances.keys()).map(k => [k, keytoKeyMap.get(k)!.length]));
    const minSteps = new Map(Array.from(entrances.keys()).map(k => [k, Infinity]));

    for (const e of entrances.keys())
        queue.enqueue({totalSteps: 0, keysObtained: '', atKey: e});

    while (!queue.isEmpty()) {
        const { totalSteps, keysObtained, atKey } = queue.dequeue()!;
        const quadrant = keyToQuadrantMap.get(atKey)!;

        if (keysObtained.length === keysPerQuadrant.get(quadrant)) {
            const currMinSteps = minSteps.get(quadrant)!;
            minSteps.set(quadrant, Math.min(currMinSteps, totalSteps));
        }

        const keysObtainedOtherQuadrants = getAllValuesExcludingKey(quadrant, allKeysInQuadrant);
        const keysObtainedSet = new GenericSet(k => k, [...keysObtained, ...keysObtainedOtherQuadrants]);
        const reachableKeys = getReachableKeys(atKey, keysObtainedSet);

        for (const key of reachableKeys) {
            const newKeysObtained = keysObtained + key.toKey;
            const newCacheKey = getCacheKey(key.toKey, newKeysObtained);
            const newTotalSteps = totalSteps + key.steps;
            if (!visited.has(newCacheKey) || visited.get(newCacheKey)! > newTotalSteps) {
                queue.enqueue({
                    totalSteps: totalSteps + key.steps,
                    atKey: key.toKey,
                    keysObtained: newKeysObtained
                });
                visited.set(newCacheKey, newTotalSteps);
            }
        }
    }
    return Array.from(minSteps.values()).reduce((a, c) => a + c, 0);
};

/*
Input: [
    [a, b],
    [c, d]
    [e]
]
Output: [
    [a, c, e],
    [a, d, e],
    [b, c, e],
    [b, d, e]
]
*/
export const combinations = <T>(keysReachableKeys: T[][]) => {
    const solutions: T[][] = [];

    const helper = (atKeyIndex: number, curr: T[]) => {
        if (curr.length === keysReachableKeys.length) {
            solutions.push([...curr]);
            return;
        }
        for (let i = atKeyIndex; i < keysReachableKeys.length; i++)
            for (let j = 0; j < keysReachableKeys[i].length; j++) {
                curr.push(keysReachableKeys[i][j]);
                helper(i + 1, curr);
                curr.pop();
            }
    };
    helper(0, []);
    return solutions;
};

export const solve = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>, entrances: Map<string, IPoint>) => {
    type QueueState = {totalSteps: number; atKeys: string[]; keysObtained: string};
    const queue = new PriorityQueue<QueueState>(p => -1 * p.totalSteps);
    const visited = new Map<string, number>();
    const getReachableKeys = makeGetReachableKeys(keytoKeyMap);

    queue.enqueue({
        totalSteps: 0,
        atKeys: Array.from(entrances.keys()),
        keysObtained: ''
    });
    while (!queue.isEmpty()) {
        const { totalSteps, atKeys, keysObtained } = queue.dequeue()!;
        if (keysObtained.length === keytoKeyMap.size - entrances.size)
            return totalSteps;

        const keysObtainedSet = new GenericSet(k => k, [...keysObtained]);
        const allRouteOptionsForAllRobots =
            combinations(
                // we're adding the current key to reachable keys to include the option of "staying put"
                // obviously, staying put has 0 steps involved
                atKeys.map(k => [{toKey: k, steps: 0}].concat(getReachableKeys(k, keysObtainedSet)))
            ).slice(1); // remove the first one because it'll be identical to the current one

        for (const routeOptionForAllRobots of allRouteOptionsForAllRobots) {
            // 0th robot moves to key robotsMoveToKey[0]
            const robotsMoveToKey = routeOptionForAllRobots.map(r => r.toKey);
            const newKeysObtained = Array.from(new GenericSet(k => k,
                robotsMoveToKey
                    .filter(k => !entrances.has(k))
                    .concat([...keysObtained]))
                .values()).join('');
            const newCacheKey = getCacheKey(robotsMoveToKey.join(''), newKeysObtained);
            const newTotalSteps = routeOptionForAllRobots.reduce((a, c) => a + c.steps, totalSteps);
            if (!visited.has(newCacheKey) || visited.get(newCacheKey)! > newTotalSteps) {
                queue.enqueue({
                    totalSteps: newTotalSteps,
                    atKeys: robotsMoveToKey,
                    keysObtained: newKeysObtained
                });
                visited.set(newCacheKey, newTotalSteps);
            }
        }
    }
    return Infinity;
};

export const run = () => {
    dropConsoleInfo();
    console.log('STARTING');
    const sims = getSimulations();
    for (const s of sims) {
        const d = getNearestKeysMap(s);
        // console.log(s.grid.map(r => r.join(' ')).join('\n'));
        console.log(timer.start(`18b - ${s.name}, ${s.keys.size} keys, ${s.doors.size} doors`));
        console.log(chalk.redBright('answer ='), lowerBound(d, s.entrances));
        console.log(timer.stop());
    }
    resetConsoleInfo();
};
