import * as input from './1.json';
import { timer } from '~/util/Timer';

export const getFuel = (mass: number): number => {
    const fuel = Math.floor(mass / 3) - 2;
    if (fuel <= 0)
        return 0;
    return fuel + getFuel(fuel);
};

export const sumFuel = (masses: number[]) => masses
    .map(getFuel)
    .reduce((a, c) => a + c, 0);

console.log(timer.start('day 1b'));
console.log(sumFuel(input.data));
console.log(timer.stop());
