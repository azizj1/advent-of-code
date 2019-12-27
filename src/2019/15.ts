import { IntcodeComputer } from '~/2019/9';
import { timer } from '~/util/Timer';
import * as input from './15.json';

export const north = 1,
    south = 2,
    west = 3,
    east = 4;

export const directions = [north, south, west, east] as const;
export type IDirection = typeof directions[number];

export const negDirection = {
    [north]: south,
    [south]: north,
    [east]: west,
    [west]: east
} as const;

export const findOyxgenSystemDfsRecursive = (comp: IntcodeComputer) => {
    const open = 1; // position changed
    const oxygenSystem = 2; // position changed
    const allSteps: number[] = [];

    const helper = (steps: number, reverse: IDirection) => {
        for (const d of directions) {
            if (d === reverse) // don't go back!
                continue;
            const output = comp.run(d);
            if (output === open)
                helper(steps + 1, negDirection[d]);
            else if (output === oxygenSystem) {
                console.log(`found a solution! Took ${steps + 1}`);
                allSteps.push(steps + 1);
                comp.run(reverse);
            }
        }
        if (steps > 0)
            comp.run(reverse);
    };

    helper(0, negDirection[east]);
    return allSteps;
};

export const run = () => {
    console.log(timer.start('15'));
    console.log(findOyxgenSystemDfsRecursive(new IntcodeComputer(input.data)));
    console.log(timer.stop());
};

// run();
