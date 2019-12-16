import { timer } from '~/util/Timer';
import * as data from './8.json';
import { last } from '~/util/util';
import * as chalk from 'chalk';

export const isTransparent = (data: number) => data === 2;

export const ans = (width: number, height: number, data: number[]) => {
    const area = width * height;
    const numOfLayers = Math.ceil(data.length / area);
    const image = Array.from({length: area}, () => 2);

    for (let i = numOfLayers - 1; i >= 0; i--) {
        const layer = data.slice(i * area, area * (i + 1));

        for (let p = 0; p < area; p++) {
            if (!isTransparent(layer[p]))
                image[p] = layer[p];
        }
    }
    return image
        .reduce((grid, c) => {
            if (last(grid).length === width)
                grid.push([]);
            last(grid).push(c);
            return grid;
        }, [[]] as number[][])
        .map(r => r.map(c => c === 1 ? chalk.default.blue.bold('1') : '0').join(' '))
        .join('\n');
};

console.log(timer.start('8'));
console.log(ans(2, 2, [0, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 0, 0, 0, 0]));
console.log(ans(25, 6, data.input));
console.log(timer.stop());
