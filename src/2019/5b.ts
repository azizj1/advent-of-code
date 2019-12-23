import { timer } from '~/util/Timer';
import { last } from '~/util/util';
import * as input from './5.json';
// import * as input2 from './2.json';
// import { promises as fs } from 'fs';

type IMode = 'immediate' | 'position';
type ICode = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

const size = {
    '1': 3,
    '2': 3,
    '3': 1,
    '4': 1,
    '5': 2,
    '6': 2,
    '7': 3,
    '8': 3,
    '9': 1
};

export const getModes = (opcodeFull: number) => {
    const opcodeArr = Array.from(opcodeFull.toString());
    const opcode = last(opcodeArr.splice(-2, 2)) as ICode;
    const modes = Array.from(opcodeArr.join('').padStart(size[opcode], '0')).reverse()
        .map<IMode>(m => m === '0' ? 'position' : 'immediate');
    return { opcode, modes };
};

const getIndex = (program: number[]) => (i: number, mode: IMode) =>
    mode === 'immediate' ? i : program[i];

/* eslint-disable */
export const command = {
    '1': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        program[getIndex(program)(start + 3, modes[2])] = op1 + op2;
        return { output: NaN, next: size['1'] + start + 1, nextInput: false};
        // console.log({op1, op2, program});
    },
    '2': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        program[getIndex(program)(start + 3, modes[2])] = op1 * op2;
        return { output: NaN, next: size['2'] + start + 1, nextInput: false};
        // console.log({op1, op2, program});
    },
    '3': (program: number[]) => (start: number, modes: IMode[], input: number) => {
        program[getIndex(program)(start + 1, modes[0])] = input;
        return { output: NaN, next: size['3'] + start + 1, nextInput: true};
    },
    '4': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        return {
            output: program[getIndex(program)(start + 1, modes[0])],
            next: size['4'] + start + 1,
            nextInput: false
        };
    },
    '5': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        return { output: NaN, next: op1 !== 0 ? op2 : size['5'] + start + 1, nextInput: false };
    },
    '6': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        return { output: NaN, next: op1 === 0 ? op2 : size['5'] + start + 1, nextInput: false };
    },
    '7': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        program[getIndex(program)(start + 3, modes[2])] = op1 < op2 ? 1 : 0;
        return { output: NaN, next: size['7'] + start + 1, nextInput: false };
        // console.log({op1, op2, program});
    },
    '8': (program: number[]) => (start: number, modes: IMode[], _: number) => {
        const op1 = program[getIndex(program)(start + 1, modes[0])];
        const op2 = program[getIndex(program)(start + 2, modes[1])];
        program[getIndex(program)(start + 3, modes[2])] = op1 === op2 ? 1 : 0;
        return { output: NaN, next: size['8'] + start + 1, nextInput: false };
        // console.log({op1, op2, program});
    },
    '9': (_: number[]) => (__: number, ___: IMode[], _: number) => ({output: NaN, next: -1, nextInput: false})
};
/* eslint-enable */

export const restore = (program: number[], start = 0) => {
    const programCopy = [...program];

    return (...inputs: number[]) => {
        let i = start;
        let inputIndex = 0;
        while (i < programCopy.length) {
            const { opcode, modes } = getModes(programCopy[i]);
            const { output, next, nextInput } = command[opcode](programCopy)(i, modes, inputs[inputIndex]);
            // console.log({opcode, modes, output, next, program});
            if (!isNaN(output)) {
                return { output, exit: false, next };
            }
            if (opcode === '9')
                return { output: NaN, exit: true, next };
            if (nextInput)
                inputIndex++;
            i = next;
        }
        return { output: NaN, exit: false, next: NaN };
    };
};

export const run = (data: number[], title: string, input = 1) => {
    console.log(timer.start(`5b - ${title}`));
    console.log(restore(data)(input));
    console.log(timer.stop());
};

export const test = () => {
        // run(input.data, '5a data');
    // run(input2.data, '2a data');
    run([3, 9, 8, 9, 10, 9, 4, 9, 99, -1, 8], 'is equal to 8', 8);
    run([3, 9, 7, 9, 10, 9, 4, 9, 99, -1, 8], 'is less than 8', 9);
    run([3, 3, 1108, -1, 8, 3, 4, 3, 99], 'is equal to 8 immediate', 9);
    run([3, 3, 1107, -1, 8, 3, 4, 3, 99], 'is less than 8 immediate', 9);
    run([3, 12, 6, 12, 15, 1, 13, 14, 13, 4, 13, 99, -1, 0, 1, 9], '0 if input 0', 1);
    run([
        3,
        21,
        1008,
        21,
        8,
        20,
        1005,
        20,
        22,
        107,
        8,
        21,
        20,
        1006,
        20,
        31,
        1106,
        0,
        36,
        98,
        0,
        0,
        1002,
        21,
        125,
        20,
        4,
        20,
        1105,
        1,
        46,
        104,
        999,
        1105,
        1,
        46,
        1101,
        1000,
        1,
        20,
        4,
        20,
        1105,
        1,
        46,
        98,
        99
    ], '999 if input < 8, 1000 if input == 8, 1001 if input > 8', 10);
    run(input.data, '5.json', 5);
};

test();
