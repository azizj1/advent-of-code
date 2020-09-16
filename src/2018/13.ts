import {PriorityQueue} from '~/util/PriorityQueue';
import {declareProblem, getRunsFromIniNewlineSep} from '~/util/util';
import input from './13.txt';
import chalk from 'chalk';

type Direction = [number, number]; // [x, y] vector

enum Turn {
    Left,
    Straight,
    Right,
}

const numTurns = Object.keys(Turn).length / 2;

export interface IPosition {
    x: number;
    y: number;
    dir: Direction;
    nextTurn: Turn;
}

export interface ISimulation {
    name: string;
    grid: string[][];
    carts: PriorityQueue<IPosition>;
}

const getCartIfExists = (grid: string[][], row: number, col: number): IPosition | null => {
    const val = grid[row][col];
    const position = {
        x: col,
        y: row,
        nextTurn: Turn.Left,
    } as const;
    switch (val) {
        case '^': return { ...position, dir: [0, -1]};
        case 'v': return { ...position, dir: [0, 1] };
        case '>': return { ...position, dir: [1, 0] };
        case '<': return { ...position, dir: [-1, 0] };
        default: return null;
    }
};

export const buildQueue = (grid: string[][], data?: IPosition[]) => {
    const cols = Math.max(...grid.map(row => row.length));
    const queue = new PriorityQueue<IPosition>(p => -1 * (p.y * cols + p.x));
    if (data != null && data.length > 0) {
        // will heapify it in O(N)
        queue.values = data;
    }
    return queue;
};

const getCartsFromGrid = (grid: string[][]) => {
    const queue = buildQueue(grid);
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cart = getCartIfExists(grid, i, j);
            if (cart != null) {
                queue.enqueue(cart);
            }
        }
    }
    return queue;
};

export const getSimulations = () => getRunsFromIniNewlineSep(input).map(s => ({
    name: s.name,
    grid: s.content.map(row => row.replace(/<|>/g, '-').replace(/\^|v/g, '|').split('')),
    carts: getCartsFromGrid(s.content.map(row => row.split('')))
})) as ISimulation[];

const isSimulation = (sp: ISimulation | IPosition): sp is ISimulation => {
    return (sp as ISimulation).name != null;
};

export const turnCart = (p: IPosition): IPosition => {
    const newPosition = { ...p, nextTurn: (p.nextTurn + 1) % numTurns };
    const [x, y] = newPosition.dir;
    switch (p.nextTurn) {
        case Turn.Straight: return newPosition;
        // comes from rotation matrix. See MD file for explanation.
        case Turn.Right: return { ...newPosition, dir: [-y, x] };
        case Turn.Left: return { ...newPosition, dir: [y, -x] };
    }
};

export const makeMoveCart = (grid: string[][]) => (p: IPosition): IPosition => {
    const [vx, vy] = p.dir;
    const y = p.y + vy;
    const x = p.x + vx;
    const next = grid[y][x];
    if (next == null) {
        throw `Position (${x}, ${y}) is null.`;
    } else if (next === '+') {
        return turnCart({ ...p, x, y });
    } else if (next === '/') {
        // see MD file for explanation
        return { ...p, x, y, dir: [-vy, -vx] };
    } else if (next === '\\') {
        return { ...p, x, y, dir: [vy, vx] };
    }
    return { ...p, x, y };
};

export const moveAllCarts = (s: ISimulation): ISimulation | IPosition => {
    const getKey = (p: IPosition) => `${p.x},${p.y}`;
    // add the current positions to the map from queue, and as we iterate through
    // the queue, remove the current positions and add the new positions
    // this will allow us to find collisions of cart X moving into cart Y
    // that hasn't moved yet.
    const nextPositions = new Map<string, IPosition>(
        s.carts.values.map(c => [getKey(c), c])
    );
    const queue = s.carts;
    const moveCart = makeMoveCart(s.grid);
    while (!queue.isEmpty()) {
        const pos = queue.dequeue()!;
        const nextPos = moveCart(pos);
        const nextPosKey = getKey(nextPos);
        nextPositions.delete(getKey(pos));
        // if next position already exists, there is a collision.
        if (nextPositions.has(nextPosKey)) {
            return nextPos;
        } else {
            nextPositions.set(nextPosKey, nextPos);
        }
    }
    return {
        ...s,
        carts: buildQueue(s.grid, Array.from(nextPositions.values()))
    };
};

export const print = (s: ISimulation) => {
    const getSymbol = (v: Direction) => {
        const [x, y] = v;
        if (x === 1) return '>';
        if (x === -1) return '<';
        if (y === 1) return 'v';
        if (y === -1) return '^';
        return s.grid[y][x];
    };
    const newGrid: string[][] = [];
    for (const row of s.grid) {
        newGrid.push([...row]);
    }
    for (const c of s.carts.values) {
        newGrid[c.y][c.x] = getSymbol(c.dir);
    }
    console.log(newGrid
        .map(row => row
            .join('')
            .replace(/(\^|v|<|>)/g, (_, m) => chalk.red(m)))
        .join('\n'));
};

export const playSimulation = (s: ISimulation) => {
    let nextSim: ISimulation | IPosition = s;
    let count = 0;
    do {
        // print(nextSim);
        count++;
        nextSim = moveAllCarts(nextSim as ISimulation);
    } while (isSimulation(nextSim));
    console.log('took', count, 'attempts');
    return nextSim;
};

export const run = () => {
    declareProblem('day 13');
    const sims = getSimulations(); // .slice(0, 1);
    for (const sim of sims) {
       console.log(playSimulation(sim));
    }
};
