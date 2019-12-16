import { timer } from '~/util/Timer';
import * as data from './8.json';

export const ans = (width: number, height: number, data: number[]) => {
    const area = width * height;
    const numOfLayers = Math.ceil(data.length / area);
    console.log(`layers = ${data.length / area}`);
    let minLayer: number[] = [];
    let minZeros = Infinity;
    for (let i = 0; i < numOfLayers; i++) {
        const layer = data.slice(i * area, area * (i + 1));
        const numOfZeros = layer.filter(p => p === 0).length;
        if (numOfZeros < minZeros) {
            minZeros = numOfZeros;
            minLayer = layer;
        }
    }
    return minLayer.filter(p => p === 1).length * minLayer.filter(p => p === 2).length;
};

console.log(timer.start('8'));
console.log(ans(25, 6, data.input));
console.log(timer.stop());
