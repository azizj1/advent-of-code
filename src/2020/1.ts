import { timer } from '~/util/Timer';
import { pipe } from '~/util/util';
import * as input from './1.json';

function getPair(data: number[], sumTo: number) {
    const workingSet = new Set();

    for (const d of data) {
        if (workingSet.has(sumTo - d)) {
            return [d, sumTo - d];
        }
        workingSet.add(d);
    }
    return [];
}

function getTriplet(data: number[], sumTo: number) {
    const workingSet = new Set();

    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            const partialSum = data[i] + data[j];
            if (partialSum < sumTo && workingSet.has(sumTo - partialSum)) {
                return [data[i], data[j], sumTo - partialSum];
            }
        }
        workingSet.add(data[i]);
    }
    return [];
}

function multiply(nums: number[]) {
    return nums.reduce((agg, curr) => agg * curr, 1);
}

export function run() {
    timer.run(pipe(getPair, multiply), 'day 1a', input.data, 2020);
    timer.run(pipe(getTriplet, multiply), 'day 1b', input.data, 2020);
}
