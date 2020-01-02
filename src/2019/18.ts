import { getRunsFromIniFile } from '~/util/util';
import input from './18.txt';
import { IPoint, toKey as toString } from '~/2019/10';
import { timer } from '~/util/Timer';

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

class GenericSet<E> extends Set<E | string | number> {
    private getHash: (e: E) => string | number;

    constructor(getHash: (e: E) => string | number, data?: E[]) {
        super();
        this.getHash = getHash;
        for (const d of data ?? [])
            this.add(d);
    }

    add(e: E) {
        super.add(this.getHash(e));
        return this;
    }

    delete(e: E) {
        return super.delete(this.getHash(e));
    }

    has(e: E) {
        return super.has(this.getHash(e));
    }
}

export const getNearestKeysMap = ({grid, keys, doors, entrance}: ITunnel) => {
    const result = new Map<string, {toKey: string; steps: GenericSet<IPoint>}[]>();
    const cache: {[toKey: string]: {[fromPoint: string]: IPoint[]}} = {}; // cache[toKey][fromPoint] = steps;
    for (const k of keys.keys()) {
        cache[k] = {};
        result.set(k, []);
    }
    result.set('@', []); // need to add this for entrance

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
    const helper = (start: IPoint, visited: Set<string>, toKey: string): IPoint[] | null => {
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

        visited.add(pointStr);
        const neighbors = getNeighbors(start).filter(n => !visited.has(toString(n)));
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
        const steps = helper(entrance, new Set(), k);
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
            const steps = helper(keys.get(fromKey)!, new Set(), toKey);
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

export const getBlocks = (
    keyToKeySteps: Map<string, {toKey: string; steps: GenericSet<IPoint>}[]>,
    doors: Map<string, IPoint>
) => {
    const blocks = {} as {[fromKey: string]: {[toKey: string]: Set<string>}};
    const allKeys = keyToKeySteps.keys();
    for (const fromKey of allKeys)
        for (const toKey of allKeys) {
            blocks[fromKey][toKey] = new Set();
        }

    for (const fromKey of allKeys) {
        for (const {toKey, steps} of keyToKeySteps.get(fromKey)!) {
            for (const [door, point] of doors.entries()) {
                if (steps.has(point))
                    blocks[fromKey][toKey].add(door);
            }
        }
    }
    return blocks;
};

// export const getDoorsNeededUnlockedMap = (doors, )

export const run = () => {
    const sims = getSimulations().slice(5, 6);
    for (const s of sims) {
        console.log(timer.start(`18 - ${s.name}, ${s.keys.size} keys, ${s.doors.size} doors`));
        // console.log(s.grid.map(r => r.join(' ')).join('\n'));
        const toPrint =
            Array.from(getNearestKeysMap(s).entries())
                .reduce((m, [k, v]) =>
                    m.set(k, v
                        .sort((a, b) => a.steps.size - b.steps.size)
                        .map(p => `${p.toKey}: ${p.steps.size}`)
                        .join('    ')
                    ),
                    new Map<string, string>());
        console.log(toPrint.get('@'));
        console.log(timer.stop());
    }
};
