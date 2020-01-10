import { IPoint, add } from '~/2019/10';
import { Direction, dy, dx } from '~/2019/11';
import { first, last, getRunsFromIniFile } from '~/util/util';
import sampleInput from './17.txt';
import { timer } from '~/util/Timer';
import { IntcodeComputer } from '~/2019/9';
import * as input from './17.json';
import { toString } from '~/2019/17';

type RelativeDirection = '' | 'right' | 'left';

interface IDirectionPoint extends IPoint {
    absoluteDirection: Direction;
    relative?: RelativeDirection;
}

interface IScaffold {
    grid: string[][];
    start: IDirectionPoint;
    name: string;
}

const otherDirections: {[dir: string]: Direction[]} = {
    'up': ['right', 'left'],
    'down': ['left', 'right'],
    'right': ['down', 'up'],
    'left': ['up', 'down']
};

const toScaffold = ({name, grid}: {name: string; grid: string[][]}): IScaffold => {
    const arrowToDir = (arrow: string): Direction | null => {
        switch (arrow) {
            case '^': return 'up';
            case 'v': return 'down';
            case '<': return 'left';
            case '>': return 'right';
            default: return null;
        }
    };
    let start: IDirectionPoint | null = null;
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++) {
            const dir = arrowToDir(grid[i][j]);
            if (dir != null) {
                start = {row: i, col: j, absoluteDirection: dir };
                break;
            }
        }
    return {
        name,
        grid,
        start: start!
    };
};

const getSimulations = () => getRunsFromIniFile(sampleInput)
    .map(s => ({
        name: s.name,
        grid: s.content.split(/\r?\n/).filter(s => s.trim() !== '').map(r => r.split(''))
    }))
    .map(toScaffold);

const getDirChange = (dir: Direction) => ({row: dy[dir], col: dx[dir]});
const addD = (p1: IPoint) => (p2: IPoint) => (absoluteDirection: Direction, relative: RelativeDirection) =>
    ({...add(p1)(p2), absoluteDirection, relative});

// can only move forward, right, or left
const getNeighbors = (p: IDirectionPoint): IDirectionPoint[] => [
    addD(p)(getDirChange(p.absoluteDirection))(p.absoluteDirection, ''),
    ...otherDirections[p.absoluteDirection].map((d, i) => addD(p)(getDirChange(d))(d, i === 0 ? 'right' : 'left'))
];

const traverse = ({grid, start}: IScaffold) => {
    console.log(start);
    const isValid = ({row, col}: IPoint) => grid?.[row]?.[col] === '#';
    const paths: [Direction, RelativeDirection, number][] = [];

    const helper = (from: IDirectionPoint) => {
        // first one will either be 'keep going forward' or 'make the only turn you can'
        const neighbor = first(getNeighbors(from).filter(isValid));
        if (neighbor == null)
            return;

        const isNewDirection = neighbor.absoluteDirection !== from.absoluteDirection;
        if (isNewDirection || paths.length === 0)
            paths.push([neighbor.absoluteDirection, neighbor.relative!, 0]);

        last(paths)[2]++;
        helper(neighbor);
    };
    helper(start);
    console.log(paths);
    return paths.map(([, r, d]) => [r.slice(0, 1).toUpperCase(), d].filter(r => r !== '').join(',')).join(',');
};

export const toGrid = (compOutput: string[]) => {
    const grid: string[][] = [[]];
    for (let i = 0; i < compOutput.length; i++) {
        if (compOutput[i] === '\n')
            grid.push([]);
        else
            last(grid).push(compOutput[i]);
    }
    return grid;
};

// ====== DON'T FORGET!!! =======
// Force the vacuum robot to wake up by changing the value in your ASCII program at address 0 from 1 to 2. When you do
// this, you will be automatically prompted for the new movement rules that the vacuum robot should use. The ASCII
// program will use input instructions to receive them, but they need to be provided as ASCII code; end each line of
// logic with a single newline, ASCII code 10.

export const run = () => {
    const sims = getSimulations().slice(2, 3);
    for (const s of sims) {
        // console.log(toString(s.grid));
        console.log(timer.start(`17b - ${s.name}`));
        console.log(traverse(s));
        console.log(timer.stop());
    }
    // it's only returning the answer when you run it in continuous-video mode (i.e., y\n instead of n\n at the end)
    console.log(timer.start('17b - run game'));
    const comp = new IntcodeComputer(input.data);
    comp.updateProgram(0, 2);
    const ans = 'A,A,B,B,C,B,C,B,C,A\nL,10,L,10,R,6\nR,12,L,12,L,12\nL,6,L,10,R,12,R,12\nn\n';
    const asciiCode = ans.split('').map(s => s.charCodeAt(0));
    console.log(asciiCode);

    const output: number[] = [];
    comp.setInput(...asciiCode);
    let lastOutput = 0;
    while (comp.hasMore()) {
        lastOutput = comp.run();
        output.push(lastOutput);
    }
    console.log(toString(toGrid(output.map(a => String.fromCharCode(a)))));
    console.log(lastOutput);
    console.log(timer.stop());
};

/*
A = L,10,L,10,R,6
B = R,12,L,12,L,12
C = L,6,L,10,R,12,R,12
*/

// A,A,B,B,C,B,C,B,C,A
// input: A,A,B,B,C,B,C,B,C,A\nL,10,L,10,R,6\nR,12,L,12,L,12\nL,6,L,10,R,12,R,12\nn\n
