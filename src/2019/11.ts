import { IntcodeComputer } from '~/2019/9';
import * as input from './11.json';
import { add } from '~/2019/10';
import chalk from 'chalk';

export const directions = ['up', 'right', 'down', 'left'] as const;
export type Direction = typeof directions[number];
export interface IPoint {
    col: number;
    row: number;
}

const dy = {
    'up': -1,
    'down': 1,
    'right': 0,
    'left': 0
};

const dx = {
    'up': 0,
    'down': 0,
    'right': 1,
    'left': -1
};

const getNewDirectionIndex = (currentIndex: number, dirChange: 0 | 1) => {
    const delta = dirChange * 2 - 1;
    return (currentIndex + delta + directions.length) % directions.length;
};

export const toKey = (point: IPoint) => `${point.col},${point.row}`;
export const fromKey = (key: string) => {
    const [col, row] = key.split(',').map(Number);
    return {col, row};
};

const isBinary = (a: number): a is 0 | 1 => a === 0 || a === 1;
const WHITE = 1;

class HullPaintingRobot {
    private computer: IntcodeComputer;
    private whitePanels: Set<string>;
    private lastDirectionIndex: number;
    private lastPoint: IPoint;
    private grid: number[][];

    constructor(computer: IntcodeComputer) {
        this.computer = computer;
        this.whitePanels = new Set();
        this.lastDirectionIndex = 0;
        this.lastPoint = {col: 0, row: 0};
        this.grid = [[1]];
    }

    start() {
        this.computer.setInput(1);
        while (this.computer.hasMore()) {
            const color = this.computer.run();
            const newDir = this.computer.run();
            // console.log(`color = ${color}\t\tnewDir=${newDir}`);
            if (isNaN(color) || isNaN(newDir))
                break;
            const newColor = this.colorAndMove(color, newDir);
            this.computer.setInput(newColor!);
        }
    }

    colorAndMove(color: number, dirChange: number) {
        const { col, row } = this.lastPoint;
        if (!isBinary(color) || !isBinary(dirChange)) {
            console.log('ERROR');
            return;
        }
        if (this.grid[row] == null)
            this.grid[row] = [];
        this.grid[row][col] = color;

        if (color === WHITE)
            this.whitePanels.add(toKey(this.lastPoint));

        this.lastDirectionIndex = getNewDirectionIndex(this.lastDirectionIndex, dirChange);
        const dir = directions[this.lastDirectionIndex];
        this.lastPoint = add(this.lastPoint)({col: dx[dir], row: dy[dir]});
        return this.grid?.[this.lastPoint.row]?.[this.lastPoint.col] ?? 0;
    }

    isBinary = (a: number): a is 0 | 1 => a === 0 || a === 1;

    get numOfPanelsPaintedWhite() {
        return this.whitePanels.size;
    }

    toString() {
        const maxCols = Math.max(...this.grid.map(r => r.length));
        for (let i = 0; i < this.grid.length; i++)
            for (let j = 0; j < maxCols; j++)
                if (this.grid[i][j] !== 1)
                    this.grid[i][j] = 0;
        const pad = (n: number | null) => n === 1 ? chalk.blue(n?.toString()) : '0';
        return this.grid.map(r => r.map(pad).join('  ')).join('\n') + '\n';
    }
}

export const ans = () => {
    const robot = new HullPaintingRobot(new IntcodeComputer(input.data));
    robot.start();
    console.log(robot.toString());
    return robot.numOfPanelsPaintedWhite;
};

console.log(ans());
