import { getRunsFromIniFile } from '~/util/util';
import input from './18.txt';
import { IPoint, toKey } from '~/2019/10';
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

const getNeighbors = ({row, col}: IPoint, exclude: IPoint | null): IPoint[] =>
    exclude == null ?
        [{row: row - 1, col}, {row: row + 1, col}, {row, col: col -1}, {row, col: col + 1}] :
        getNeighbors({row, col}, null).filter(p => p.row !== exclude.row || p.col !== exclude.col);

export const collectKeys = ({grid, keys, entrance}: ITunnel) => {

    const get = ({row, col}: IPoint) => grid[row][col];
    const isValid = (p: IPoint, visited: Set<string>, keysObtained: Set<string>) => {
        const cell = get(p);
        const pHash = toKey(p);
        if (cell == null ||
            cell !== '.' &&
            cell !== '@' &&
            toKey(keys.get(cell)) !== pHash && // stepping on a key is valid
            !keysObtained.has(cell.toLowerCase()) && // stepping on A if 'a' is obtained is valid
            !visited.has(pHash)
        )
            return false;
        return true;
    };

    const helper = (start: IPoint, from: IPoint | null, visited: Set<string>, keysObtained: Set<string>): number => {
        if (!isValid(start, visited, keysObtained))
            return Infinity;

        console.log('at ', toKey(start));
        const cell = get(start);
        let onKey = false;

        visited.add(toKey(start));
        if (keys.has(cell)) {
            console.log('OBTAINED KEY: ', cell);
            keysObtained.add(cell);
            onKey = true;
            if (keysObtained.size === keys.size)
                return 0;
        }

        // if currently stepping on key, you're allowed to go back
        const neighbors = getNeighbors(start, onKey ? null : from);
        const steps: number[] = [];
        for (const neighbor of neighbors)
            steps.push(helper(neighbor, start, onKey ? new Set() : visited, keysObtained));

        if (steps.every(s => s === Infinity)) {
            visited.delete(toKey(from));
            
        }
        return 1 + Math.min(...steps);
    };

    return helper(entrance, null, new Set(), new Set());
};

export const run = () => {
    const sims = getSimulations().slice(1, 2);
    for (const s of sims) {
        console.log(timer.start(`18 - ${s.name}`));
        console.log(s.grid.map(r => r.join(' ')).join('\n'));
        console.log(collectKeys(s));
        console.log(timer.stop());
    }
};
