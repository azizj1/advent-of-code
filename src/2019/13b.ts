import { IntcodeComputer } from '~/2019/9';
import * as input from './13.json';
import { coloredGrid } from '~/2019/15b';

/*
0 is an empty tile. No game object appears in this tile.
1 is a wall tile. Walls are indestructible barriers.
2 is a block tile. Blocks can be broken by the ball.
3 is a horizontal paddle tile. The paddle is indestructible.
4 is a ball tile. The ball moves diagonally and bounces off objects.
*/

const isBall = (n: number) => n === 4;
const isPaddle = (n: number) => n === 3;

export const getMark = (tileId: number) => {
    switch (tileId) {
        case 1: return '#';
        case 2: return '|';
        case 3: return '_';
        case 4: return 'O';
        case 0: return ' ';
        default: {
            console.log('SHOULDNT BE HERE: ', tileId);
            return ' ';
        }
    }
};

export const draw = (comp: IntcodeComputer) => {
    const grid: string[][] = [];

    const markGrid = (x: number, y: number, tileId: number) => {
        if (grid[y] == null)
            grid[y] = [];
        grid[y][x] = getMark(tileId);
    };

    while (comp.hasMore()) {
        const x = comp.run();
        const y = comp.run();
        const tileId = comp.run();
        markGrid(x, y, tileId);
    }

    return grid;
};

export const play = (comp: IntcodeComputer) => {
    let paddle: number | null = null;
    let ball: number | null = null;
    let score = 0;
    while (comp.hasMore()) {
        const input = paddle != null && ball != null ? Math.sign(ball - paddle) : 0;
        comp.setInput(input);
        const x = comp.run();
        const y = comp.run();
        const tileId = comp.run();
        if (isBall(tileId))
            ball = x;
        if (isPaddle(tileId))
            paddle = x;
        if (x === -1 && y === 0)
            score = tileId;
    }
    return score;
};

export const run = () => {
    const grid = draw(new IntcodeComputer(input.data));
    const printable = coloredGrid(grid, c => c);
    console.log(printable.map(r => r.join(' ')).join('\n'));
    console.log('END');

    const comp = new IntcodeComputer(input.data);
    comp.updateProgram(0, 2);
    const result = play(comp);
    console.log('result: ', result);
};
