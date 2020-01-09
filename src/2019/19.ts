import { IntcodeComputer } from '~/2019/9';
import * as input from './19.json';

const getPointsAffected = (comp: IntcodeComputer) => {
    let sum = 0;
    for (let i = 0; i < 50; i++)
        for (let j = 0; j < 50; j++) {
            const output = comp.run(i, j);
            comp.reset();
            sum += output;
        }
    return sum;
};

export const run = () => {
    console.log(input.data.length);
    const comp = new IntcodeComputer(input.data);
    console.log(getPointsAffected(comp));
};
