import { IPoint } from '~/2019/10';
import { getDistancesToAllKeys, IBaseTunnel, IKeyToKeyInfo, makeGetReachableKeys, getCacheKey } from '~/2019/18';
import { getRunsFromIniFile } from '~/util/util';
import input from './18b.txt';
import { timer } from '~/util/Timer';
import { PriorityQueue } from '~/util/PriorityQueue';
import { GenericSet } from '~/util/GenericSet';
import chalk from 'chalk';

console.info = () => void 0;

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

const getOtherKeysObtained = (quadrant: string, quadrantLastKeysObtained: Map<string, string>) => {
    let keysObtained = '';
    for (const k of quadrantLastKeysObtained.keys())
        if (k !== quadrant)
            keysObtained += quadrantLastKeysObtained.get(k);
    return keysObtained;
};

export const solve = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>, entrances: Map<string, IPoint>) => {
    let failureWeight = 10000;
    type QueueState = {totalSteps: number; keysObtained: string; atKey: string; failedAttempts?: number};
    const queue = new PriorityQueue<QueueState>(p => p.failedAttempts != null ? -1 * (failureWeight++) : -p.totalSteps);
    const visited = new Map<string, number>();
    const getReachableKeys = makeGetReachableKeys(keytoKeyMap);
    const keyToQuadrantMap = getKeyToEntranceMap(keytoKeyMap, entrances); // key to entrance it belongs to
    const quadrantLastKeysObtained = new Map(Array.from(entrances.keys()).map(k => [k, '']));
    const keysPerQuadrant = new Map(Array.from(entrances.keys()).map(k => [k, keytoKeyMap.get(k)!.length]));
    console.info('keysPerQuadrant', keysPerQuadrant);
    const minSteps = new Map(Array.from(entrances.keys()).map(k => [k, Infinity]));

    for (const e of entrances.keys())
        queue.enqueue({totalSteps: 0, keysObtained: '', atKey: e});

    while (!queue.isEmpty()) {
        const { totalSteps, keysObtained, atKey, failedAttempts = 0 } = queue.dequeue()!;
        const quadrant = keyToQuadrantMap.get(atKey)!;
        if (quadrantLastKeysObtained.get(quadrant)!.length < keysObtained.length)
            quadrantLastKeysObtained.set(quadrant, keysObtained);
        if (keysObtained.length === keysPerQuadrant.get(quadrant)) {
            const currMinSteps = minSteps.get(quadrant)!;
            minSteps.set(quadrant, Math.min(currMinSteps, totalSteps));
            console.info(`DONE for ${quadrant}. Total steps = ${minSteps.get(quadrant)}, keysObtained = ${keysObtained}`);
            console.info(quadrantLastKeysObtained);
        }
        const keysObtainedOtherQuadrants = getOtherKeysObtained(quadrant, quadrantLastKeysObtained);
        const keysObtainedSet = new GenericSet(k => k, [...keysObtained, ...keysObtainedOtherQuadrants]);
        const reachableKeys = getReachableKeys(atKey, keysObtainedSet);
        console.info('atKey:', atKey, 'keysObtained', keysObtained, 'totalSteps:', totalSteps, 'otherKeys', keysObtainedOtherQuadrants);

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
    console.info(minSteps);
    return Array.from(minSteps.values()).reduce((a, c) => a + c, 0);
};
/* eslint-disable */
// export const solve = (keytoKeyMap: Map<string, IKeyToKeyInfo[]>, entrances: Map<string, IPoint>) => {
//     type QueueState = {totalSteps: number; keysObtained: string; atKey: string};
//     const queue = new Queue<QueueState>();
//     const visited = new Map<string, number>();
//     const getReachableKeys = makeGetReachableKeys(keytoKeyMap);
//     let count = 0;
//     let minSteps = Infinity;
//     let skippedOverSome = false;
//     console.log('entrances', entrances);

//     for (const e of entrances.keys())
//         queue.enqueue({totalSteps: 0, keysObtained: '', atKey: e});

//     while (!queue.isEmpty()) {
//         count++;
//         const { totalSteps, keysObtained, atKey, failed } = queue.dequeue()!;
//         console.log('atKey:', atKey, 'keysObtained', keysObtained, 'totalSteps:', totalSteps, 'queueSize', queue.size());
//         if (keysObtained.length === keytoKeyMap.size - entrances.size) {
//             minSteps = Math.min(totalSteps, minSteps);
//             continue;
//         }
//         // if you dequeue a failed item, that means all remaining items in the queue are failures, so gtfo
//         if (failed) {
//             console.log('NO SOLUTION FOUND');
//             break;
//         }
//         if (count > 10)
//             break;
//         const keysObtainedSet = new GenericSet(k => k, [...keysObtained]);
//         const reachableKeys = getReachableKeys(atKey, keysObtainedSet);
//         console.log(`\treachable=${reachableKeys.map(k => k.toKey)}`);

//         if (reachableKeys.length === 0) {
//             const hasKeysToGetInFuture = keytoKeyMap.get(atKey)!.filter(k => !keysObtainedSet.has(k.toKey)).length > 0;
//             if (hasKeysToGetInFuture) {
//                 console.log(`adding ${atKey} (${entrances.get(atKey)?.col},${entrances.get(atKey)?.row}) to failed`);
//                 skippedOverSome = true;
//                 queue.enqueue({ totalSteps, atKey, keysObtained });
//             }
//         }
//         if (reachableKeys.length > 0 && skippedOverSome) {
//             queue.values.forEach(q => q.failed = false);
//             queue.heapify();
//             skippedOverSome = false;
//         }
//         for (const key of reachableKeys) {
//             const newKeysObtained = keysObtained + key.toKey;
//             const newCacheKey = getCacheKey(key.toKey, newKeysObtained);
//             const newTotalSteps = totalSteps + key.steps;
//             if (!visited.has(newCacheKey) || visited.get(newCacheKey)! > newTotalSteps) {
//                 queue.enqueue({
//                     totalSteps: totalSteps + key.steps,
//                     atKey: key.toKey,
//                     keysObtained: newKeysObtained
//                 });
//                 visited.set(newCacheKey, newTotalSteps);
//             }
//         }
//     }
//     console.log('iterations =', count);
//     return minSteps;
// };
/* eslint-enable */

export const run = () => {
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
        console.log(chalk.redBright('answer ='), solve(d, s.entrances));
        console.log(timer.stop());
    }
};
