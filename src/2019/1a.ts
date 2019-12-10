import * as input from './1.json';
import { timer } from '~/util/Timer';

export const sumFuel = (masses: number[]) =>
    masses.map(m => Math.floor(m / 3) - 2)
    .reduce((a, c) => a + c, 0);

console.log(timer.start('day 1a'));
console.log(sumFuel(input.data));
console.log(timer.stop());
