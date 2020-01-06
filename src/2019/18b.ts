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

export const solve = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>, entrances: Map<string, IPoint>) => {
    let failureWeight = 10000;
    type QueueState = {totalSteps: number; keysObtained: string; atKey: string; failedAttempts?: number};
    // the prioritizer function is called only when an empty is inserted, so we increment failureWeight every time
    // a failedAttempt is added, to make sure its added at the bottom of the queue.
    const queue = new PriorityQueue<QueueState>(p => p.failedAttempts != null ? -1 * (failureWeight++) : -p.totalSteps);
    const visited = new Map<string, number>();
    const getReachableKeys = makeGetReachableKeys(keytoKeyMap);
    const keyToQuadrantMap = getKeyToEntranceMap(keytoKeyMap, entrances); // key to entrance it belongs to
    const quadrantLastKeysObtained = new Map(Array.from(entrances.keys()).map(k => [
        k, // key of the Map
        keytoKeyMap.get(k)!.map(k1 => k1.toKey).join('') // all keys reachable by entrance, regardless of doors in way
    ]));
    const keysPerQuadrant = new Map(Array.from(entrances.keys()).map(k => [k, keytoKeyMap.get(k)!.length]));
    const minSteps = new Map(Array.from(entrances.keys()).map(k => [k, Infinity]));

    for (const e of entrances.keys())
        queue.enqueue({totalSteps: 0, keysObtained: '', atKey: e});

    while (!queue.isEmpty()) {
        const { totalSteps, keysObtained, atKey, failedAttempts = 0 } = queue.dequeue()!;
        const quadrant = keyToQuadrantMap.get(atKey)!;

        if (keysObtained.length === keysPerQuadrant.get(quadrant)) {
            const currMinSteps = minSteps.get(quadrant)!;
            minSteps.set(quadrant, Math.min(currMinSteps, totalSteps));
        }

        const keysObtainedOtherQuadrants = getAllValuesExcludingKey(quadrant, quadrantLastKeysObtained);
        const keysObtainedSet = new GenericSet(k => k, [...keysObtained, ...keysObtainedOtherQuadrants]);
        const reachableKeys = getReachableKeys(atKey, keysObtainedSet);

        if (reachableKeys.length === 0 && failedAttempts < 10) {
            const hasKeysToGetInFuture = keytoKeyMap.get(atKey)!.filter(k => !keysObtainedSet.has(k.toKey)).length > 0;
            if (hasKeysToGetInFuture) {
                console.info(`\tadding ${atKey} (${entrances.get(atKey)?.col},${entrances.get(atKey)?.row}) to failed`);
                queue.enqueue({ totalSteps, keysObtained, atKey, failedAttempts: failedAttempts + 1 });
            }
        }
        if (reachableKeys.length === 0 && failedAttempts >= 10) {
            console.info(`${atKey} has failed ${failedAttempts} times. It is now discarded`);
        }

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
    console.log(minSteps);
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

export const solve2 = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>, entrances: Map<string, IPoint>) => {
    type QueueState = {totalSteps: number; atKeys: string[]; allKeysObtained: string};
    const queue = new PriorityQueue<QueueState>(p => -1 * p.totalSteps);
    const visited = new Map<string, number>();
    const getReachableKeys = makeGetReachableKeys(keytoKeyMap);
    let minSteps = Infinity;

    queue.enqueue({
        totalSteps: 0,
        atKeys: Array.from(entrances.keys()),
        allKeysObtained: ''
    });
    while (!queue.isEmpty()) {
        const { totalSteps, atKeys, allKeysObtained } = queue.dequeue()!;
        console.info('atKey:', atKeys, 'keysObtained', allKeysObtained, 'totalSteps:', totalSteps);
        if (allKeysObtained.length === keytoKeyMap.size - entrances.size) {
            minSteps = Math.min(totalSteps, minSteps);
            continue;
        }
        const keysObtainedSet = new GenericSet(k => k, [...allKeysObtained]);
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
                    .concat([...allKeysObtained]))
                .values()).join('');
            const newCacheKey = getCacheKey(robotsMoveToKey.join(''), newKeysObtained);
            const newTotalSteps = routeOptionForAllRobots.reduce((a, c) => a + c.steps, totalSteps);
            if (!visited.has(newCacheKey) || visited.get(newCacheKey)! > newTotalSteps) {
                queue.enqueue({
                    totalSteps: newTotalSteps,
                    atKeys: robotsMoveToKey,
                    allKeysObtained: newKeysObtained
                });
                visited.set(newCacheKey, newTotalSteps);
            }
        }
    }
    return minSteps;
};

export const run = () => {
    dropConsoleInfo();
    console.log('STARTING');
    const sims = getSimulations();
    for (const s of sims) {
        const d = getNearestKeysMap(s);
        // console.log(s.grid.map(r => r.join(' ')).join('\n'));
        console.log(timer.start(`18b - ${s.name}, ${s.keys.size} keys, ${s.doors.size} doors`));
        Array.from(d.keys()).forEach(k =>
            console.info(`key=${k}\t`, d.get(k)?.map(a => `${a.toKey}: ${a.steps} (${Array.from(a.keysInWay.values()).concat(Array.from(a.doorsInWay.values()))})`).join('   '))
        );
        console.log('entrances', s.entrances);
        console.log(chalk.redBright('answer ='), solve2(d, s.entrances));
        console.log(timer.stop());
    }
    resetConsoleInfo();
};
