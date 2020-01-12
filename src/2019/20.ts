import { getRunsFromIniFile, first } from '~/util/util';
import input from './20.txt';
import { IPoint, toKey } from '~/2019/10';
import { timer } from '~/util/Timer';
import { WGraph } from '~/util/WeightedGraph';
import { PriorityQueue } from '~/util/PriorityQueue';
import { getNeighbors, equals } from '~/2019/18';

interface IMaze {
    name: string;
    grid: string[][];
    entrance: IPoint;
    exit: IPoint;
    portals: Map<string, [IPoint, IPoint] | [IPoint]>;
    portalLocations: Map<string, string>; // key is IPoint in toString()
}

const entranceKey = 'AA';
const exitKey = 'ZZ';

const toMaze = ({name, grid}: {name: string; grid: string[][]}): IMaze => {
    const getKey = (i: number, j: number) => {
        if (/^[A-Z]$/.test(grid[i - 1]?.[j]) && grid[i - 2]?.[j] === '.')
            return {key: grid[i - 1][j] + grid[i][j], forPoint: { col: j, row: i - 2 }};
        if (/^[A-Z]$/.test(grid[i + 1]?.[j]) && grid[i + 2]?.[j] === '.')
            return {key: grid[i][j] + grid[i + 1][j], forPoint: { col: j, row: i + 2 }};

        if (/^[A-Z]$/.test(grid[i]?.[j - 1]) && grid[i]?.[j - 2] === '.')
            return {key: grid[i][j - 1] + grid[i][j], forPoint: { col: j - 2, row: i }};
        if (/^[A-Z]$/.test(grid[i]?.[j + 1]) && grid[i]?.[j + 2] === '.')
            return {key: grid[i][j] + grid[i][j + 1], forPoint: { col: j + 2, row: i }};
        return { key: null, forPoint: null };
    };
    const portals = new Map<string, [IPoint, IPoint] | [IPoint]>();
    const portalLocations = new Map<string, string>();

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (!/^[A-Z]$/.test(grid[i]?.[j]))
                continue;
            const { key, forPoint } = getKey(i, j);
            if (key == null || forPoint == null)
                continue;
            portalLocations.set(toKey(forPoint), key);
            if (portals.has(key))
                portals.get(key)!.push(forPoint);
            else
                portals.set(key, [forPoint]);
        }
    }
    return {
        name,
        grid,
        portals,
        portalLocations,
        entrance: first(portals.get(entranceKey)!),
        exit: first(portals.get(exitKey)!)
    };
};

const makeIsValid = (grid: string[][], entrance: IPoint) => ({col, row}: IPoint) => {
    const cell = grid?.[row]?.[col];
    if (cell == null || cell !== '.' || row === entrance.row && col === entrance.col)
        return false;
    return true;
};

const toGraph = ({entrance, exit, grid, portals, portalLocations}: IMaze) => {
    const graph = new WGraph<string, number>();
    const queue = new PriorityQueue<{at: IPoint; lastPortal: string; steps: number}>(p => -1 * p.steps);
    const visited = new Map<string, number>(); // IPoint -> distance from entrance
    const isValid = makeIsValid(grid, entrance);
    queue.enqueue({at: entrance, steps: 0, lastPortal: entranceKey});
    visited.set(toKey(entrance), 0);

    while (!queue.isEmpty()) {
        const { at, steps, lastPortal } = queue.dequeue()!;
        if (equals(at, exit))
            break; // done
        const neighbors = getNeighbors(at).filter(isValid);
        // console.info('atPoint', toKey(at), 'steps', steps, 'lastPortal', lastPortal, 'neighbors', neighbors.map(n => toKey(n)));
        // console.info(grid.map((r, row) => r.map((c, col) => equals(at, {col, row}) ? 'X' : c).join('')).join('\n'));
        for (const neighbor of neighbors) {
            const neighborStr = toKey(neighbor);
            const newSteps = steps + 1;

            if (!visited.has(neighborStr) || visited.get(neighborStr)! > newSteps) {
                const neighborAtPortal = portalLocations.get(neighborStr);
                if (neighborAtPortal != null) {
                    if (neighborAtPortal === lastPortal)
                        continue;
                    const portalTo = first(portals.get(neighborAtPortal)!.filter(p => !equals(p, neighbor)));
                    queue.enqueue({
                        at: portalTo ?? neighbor, // possible if portal === 'ZZ'
                        lastPortal: neighborAtPortal,
                        steps: newSteps + 1
                    });
                    graph.addDirectedEdge(lastPortal, neighborAtPortal, newSteps);
                    visited.set(toKey(portalTo), newSteps);
                }
                else {
                    queue.enqueue({
                        at: neighbor,
                        lastPortal: lastPortal,
                        steps: newSteps
                    });
                }
                visited.set(neighborStr, newSteps);
            }
        }

    }
    return graph;
};

const getSimulations = () => getRunsFromIniFile(input).map(ini => ({
    name: ini.name,
    grid: ini.content.split(/\r?\n/).filter(s => s.trim() !== '').map(r => r.split(''))
})).map(toMaze);

export const run = () => {
    const sims = getSimulations(); // .slice(0, 1);
    for (const s of sims) {
        console.log(timer.start(`20 - ${s.name}`));
        console.log(s.portals);
        const graph = toGraph(s);
        console.log(graph.toString(n => n?.toString() ?? ''));
        console.log(timer.stop());
    }
};
