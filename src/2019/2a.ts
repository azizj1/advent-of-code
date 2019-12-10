import * as input from './2.json';
import { timer } from '~/util/Timer';

export const restore = (program: number[]) => {
    program[1] = 12;
    program[2] = 2;
    for (let i = 0; i < program.length; i = i + 4) {
        const opcode = program[i];
        if (opcode === 99)
            return program[0];
        if (opcode !== 1 && opcode !== 2)
            return null;
        const a = program[program[i + 1]];
        const b = program[program[i + 2]];
        program[program[i + 3]] = opcode === 1 ? a + b : a * b;
    }
};

console.log(timer.start('2a'));
console.log(restore(input.data));
console.log(timer.stop());
