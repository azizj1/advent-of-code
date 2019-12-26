import { IntcodeComputer } from '~/2019/9';
import * as input from './13.json';

export interface ITile {
    x: number;
    y: number;
    tileId: number;
}

const isBlockTile = (tile: ITile) => tile.tileId === 2;

/*
0 is an empty tile. No game object appears in this tile.
1 is a wall tile. Walls are indestructible barriers.
2 is a block tile. Blocks can be broken by the ball.
3 is a horizontal paddle tile. The paddle is indestructible.
4 is a ball tile. The ball moves diagonally and bounces off objects.
*/

export const getNumOfBlockTiles = (cpu: IntcodeComputer) => {
    const tiles: ITile[] = [];
    let count = 0;
    while (cpu.hasMore()) {
        const x = cpu.run();
        const y = cpu.run();
        const tileId = cpu.run();
        const tile = {x, y, tileId};
        tiles.push(tile);
        if (isBlockTile(tile))
            count++;
    }
    return count;
};

export const run = () => {
    console.log(getNumOfBlockTiles(new IntcodeComputer(input.data)));
};

// run();
