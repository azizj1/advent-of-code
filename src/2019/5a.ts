import { timer } from '~/util/Timer';
import { last } from '~/util/util';
import * as input from './5.json';
import * as input2 from './2.json';
// import { promises as fs } from 'fs';

type IMode = 'immediate' | 'position';
type ICode = '1' | '2' | '3' | '4' | '9';

const size = {
    '1': 3,
    '2': 3,
    '3': 1,
    '4': 1,
    '9': 1
};

const getModes = (opcodeFull: number) => {
    const opcodeArr = Array.from(opcodeFull.toString());
    const opcode = last(opcodeArr.splice(-2, 2)) as ICode;
    const modes = Array.from(opcodeArr.join('').padStart(size[opcode], '0')).reverse()
        .map<IMode>(m => m === '0' ? 'position' : 'immediate');
    return { opcode, modes };
};

const getIndex = (program: number[]) => (i: number, mode: IMode) =>
    mode === 'immediate' ? i : program[i];

/* eslint-disable */
const command = {
    '1': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        program[getIndex(program)(start + 3, modes[2])] = op1 + op2;
        return NaN;
        // console.log({op1, op2, program});
    },
    '2': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        program[getIndex(program)(start + 3, modes[2])] = op1 * op2;
        return NaN;
        // console.log({op1, op2, program});
    },
    '3': (program: number[]) => (start: number, modes: IMode[], input: number) => {
        program[getIndex(program)(start + 1, modes[0])] = input;
        return NaN;
    },
    '4': (program: number[]) => (start: number, modes: IMode[], _: number) =>
        program[getIndex(program)(start + 1, modes[0])],
    '9': (_: number[]) => (__: number, ___: IMode[], _: number) => NaN
};
/* eslint-enable */

export const restore = (program: number[]) => (input: number) => {
    let i = 0;
    let last = -1;
    // let programBefore = [...program];
    while (i < program.length) {
        const { opcode, modes } = getModes(program[i]);
        const output = command[opcode](program)(i, modes, input);
        if (!isNaN(output) && output !== 0) {
            // await fs.writeFile('output.txt', programBefore.join('\n'));
            return { output, modes: getModes(program[i]), last };
        }
        if (opcode === '9')
            return program[0];
        last = i;
        i += size[opcode] + 1;
        // programBefore = [...program];
    }
};

export const run = (data: number[]) => {
    console.log(timer.start('5a'));
    console.log(restore(data)(1));
    console.log(timer.stop());
};

run(input.data);
run(input2.data);
