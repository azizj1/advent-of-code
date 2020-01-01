import { getRunsFromIniFile } from '~/util/util';
import input from './18.txt';
import { IPoint, toKey as toString } from '~/2019/10';
import { timer } from '~/util/Timer';
import { PriorityQueue } from '~/util/PriorityQueue';

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
    const result = new Map<string, PriorityQueue<{toKey: string; steps: number}>>();
    const cache: {[toKey: string]: {[fromPoint: string]: number}} = {}; // cache[toKey][fromPoint] = steps;
    for (const k of keys.keys()) {
        cache[k] = {};
        result.set(k, new PriorityQueue(k => k.steps));
    }
    result.set('@', new PriorityQueue(k => k.steps)); // need to add this for entrance

    const get = ({row, col}: IPoint) => grid[row][col];
    const isValid = (p: IPoint, visited: Set<string>) => {
        const cell = get(p);
        if (cell == null ||
            cell !== '.' &&
            cell !== '@' &&
            !equals(keys.get(cell), p) && // stepping on a key is valid
            !equals(doors.get(cell), p) && // stepping on a door is valid. We don't care about doors right now
            !visited.has(toString(p))
        )
            return false;
        return true;
    };
    const helper = (start: IPoint, visited: Set<string>, toKey: string): number => {
        if (!isValid(start, visited))
            return Infinity;
        console.log('at', start, 'looking for', toKey);
        const cell = get(start);
        const pointStr = toString(start);
        if (cache[toKey][pointStr] != null) {
            console.log('HIT CACHE! from:', start, 'to:', toKey, 'steps:', cache[toKey][pointStr]);
            return cache[toKey][pointStr];
        }
        if (cell === toKey)
            return 0;

        visited.add(pointStr);
        const neighbors = getNeighbors(start).filter(n => !visited.has(toString(n)));
        const steps: number[] = [];
        for (const neighbor of neighbors)
            steps.push(helper(neighbor, visited, toKey));

        const minSteps = 1 + Math.min(...steps);
        cache[toKey][pointStr] = minSteps;
        console.log('put', cache[toKey][pointStr], 'into cache for toKey =', toKey, 'point =', pointStr);
        return minSteps;
    };

    for (const k of keys.keys())
        result.set('@', result.get('@')!.insert({
            toKey: k,
            steps: helper(entrance, new Set(), k)
        }));
    for (const fromKey of keys.keys())
        for (const toKey of keys.keys()) {
            if (fromKey === toKey)
                continue;
            const steps = helper(keys.get(fromKey)!, new Set(), toKey);
            // if fromKey to toKey is 5 steps, then toKey to fromKey is 5 steps.
            cache[fromKey][toString(keys.get(toKey))] = steps;
            result.set(fromKey, result.get(fromKey)!.insert({
                toKey,
                steps
            }));
        }
    return result;
};

export const run = () => {
    const sims = getSimulations().slice(0, 1);
    for (const s of sims) {
        console.log(timer.start(`18 - ${s.name}`));
        console.log(s.grid.map(r => r.join(' ')).join('\n'));
        console.log(Array.from(getNearestKeysMap(s).entries()).reduce((m, [k, v]) => m.set(k, v.toString()), new Map<string, {toKey: string; steps: number}[]>()));
        console.log(timer.stop());
    }
};
