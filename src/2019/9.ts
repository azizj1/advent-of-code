import { timer } from '~/util/Timer';
import * as input from './9.json';

const assertAllCasesHandled = (a: never) => a;

type IMode = 'immediate' | 'position' | 'relative';
type ICode = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '99';

const size = {
    '01': 3,
    '02': 3,
    '03': 1,
    '04': 1,
    '05': 2,
    '06': 2,
    '07': 3,
    '08': 3,
    '09': 1,
    '99': 0
};

export class IntcodeComputer {
    private program: number[];
    private originalProgam: number[];
    private nextIndex: number;

    private inputs: number[];
    private inputIndex: number;

    private relativeBaseOffset: number;

    private lastOutput: number;

    constructor(program: number[], ...inputs: number[]) {
        this.program = [...program];
        this.originalProgam = [...program];
        this.nextIndex = 0;
        this.inputs = inputs;
        this.inputIndex = 0;
        this.relativeBaseOffset = 0;
        this.lastOutput = 0;
    }

    private next() {
        const { opcode: code, modes } = IntcodeComputer.getModes(this.program[this.nextIndex]);
        switch(code) {
            case '01': { // add
                const op1 = this.program[this.getIndex(this.nextIndex + 1, modes[0])] ?? 0;
                const op2 = this.program[this.getIndex(this.nextIndex + 2, modes[1])] ?? 0;
                this.program[this.getIndex(this.nextIndex + 3, modes[2])] = op1 + op2;
                this.nextIndex += size[code] + 1;

                return { halt: false, output: NaN };
            }
            case '02': { // multiply
                const op1 = this.program[this.getIndex(this.nextIndex + 1, modes[0])] ?? 0;
                const op2 = this.program[this.getIndex(this.nextIndex + 2, modes[1])] ?? 0;
                this.program[this.getIndex(this.nextIndex + 3, modes[2])] = op1 * op2;
                this.nextIndex += size[code] + 1;

                return { halt: false, output: NaN };
            }
            case '03': { // store an input
                if (this.inputIndex >= this.inputs.length) {
                    return { halt: true, output: NaN };
                }
                this.program[this.getIndex(this.nextIndex + 1, modes[0])] = this.inputs[this.inputIndex++];
                this.nextIndex += size[code] + 1;
                return { halt: false, output: NaN };
            }
            case '04': { // return an output
                const output = this.program[this.getIndex(this.nextIndex + 1, modes[0])];
                this.nextIndex += size[code] + 1;
                this.lastOutput = output;
                return { halt: false, output };
            }
            case '05': { // jump if not equal to 0
                const op1 = this.program[this.getIndex(this.nextIndex + 1, modes[0])] ?? 0;
                const op2 = this.program[this.getIndex(this.nextIndex + 2, modes[1])] ?? 0;
                this.nextIndex = op1 !== 0 ? op2 : size[code] + this.nextIndex + 1;
                return { halt: false, output: NaN };
            }
            case '06': { // jump if equal to 0
                const op1 = this.program[this.getIndex(this.nextIndex + 1, modes[0])] ?? 0;
                const op2 = this.program[this.getIndex(this.nextIndex + 2, modes[1])] ?? 0;
                this.nextIndex = op1 === 0 ? op2 : size[code] + this.nextIndex + 1;
                return { halt: false, output: NaN };
            }
            case '07': { // if less than, set to 1
                const op1 = this.program[this.getIndex(this.nextIndex + 1, modes[0])] ?? 0;
                const op2 = this.program[this.getIndex(this.nextIndex + 2, modes[1])] ?? 0;
                this.program[this.getIndex(this.nextIndex + 3, modes[2])] = op1 < op2 ? 1 : 0;
                this.nextIndex += size[code] + 1;
                return { halt: false, output: NaN };
            }
            case '08': { // if equal, set to 1
                const op1 = this.program[this.getIndex(this.nextIndex + 1, modes[0])] ?? 0;
                const op2 = this.program[this.getIndex(this.nextIndex + 2, modes[1])] ?? 0;
                this.program[this.getIndex(this.nextIndex + 3, modes[2])] = op1 === op2 ? 1 : 0;
                this.nextIndex += size[code] + 1;
                return { halt: false, output: NaN };
            }
            case '09': { // change relative mode offset
                const op1 = this.program[this.getIndex(this.nextIndex + 1, modes[0])] ?? 0;
                this.relativeBaseOffset += op1;
                this.nextIndex += size[code] + 1;
                return { halt: false, output: NaN };
            }
            case '99': {
                this.nextIndex += size[code] + 1;
                return { halt: true, output: NaN };
            }
            default: {
                console.log('INTCODE ERROR 9.ts');
                assertAllCasesHandled(code);
                return { halt: false, output: NaN };
            }
        }
    }

    hasMore() {
        const { opcode } = IntcodeComputer.getModes(this.program[this.nextIndex]);
        return opcode !== '99';
    }

    run(...inputs: number[]) {
        if (inputs.length > 0)
            this.setInput(...inputs);

        while (this.hasMore()) {
            const { output, halt } = this.next();
            if (!isNaN(output))
                return output;
            // it'll usually break from this.hasMore() because halt: true is usually just from code 99, but we can
            // get halt = true from input command too, but halt: true can be sent from input command
            if (halt)
                return output;
        }
        return NaN;
    }

    reset() {
        this.program = [...this.originalProgam];
        this.nextIndex = 0;
        this.inputs = [];
        this.inputIndex = 0;
        this.relativeBaseOffset = 0;
        this.lastOutput = 0;
    }

    get output() {
        return this.lastOutput;
    }

    get state() {
        return this.program;
    }

    get nextInputs() {
        return this.inputs.slice(this.inputIndex);
    }

    setInput(...inputs: number[]) {
        this.inputs = inputs;
        this.inputIndex = 0;
    }

    pushInputs(...inputs: number[]) {
        this.inputs.push(...inputs);
    }

    updateProgram(index: number, value: number) {
        this.program[index] = value;
    }

    private getIndex(i: number, mode: IMode) {
        if (mode === 'immediate')
            return i;
        if (mode === 'position')
            return this.program[i] ?? 0;
        const index = (this.program[i] ?? 0) + this.relativeBaseOffset;
        return index;
    }

    static getModes(opcodeFull: number) {
        const opcodeArr = Array.from(opcodeFull.toString());
        const opcode = opcodeArr.splice(-2, 2).join('').padStart(2, '0') as ICode;
        const modes = Array.from(opcodeArr.join('').padStart(size[opcode], '0')).reverse()
            .map<IMode>(m => {
                if (m === '0')
                    return 'position';
                if (m === '1')
                    return 'immediate';
                return 'relative';
            });
        return { opcode, modes };
    }
}

export const run = (data: number[], title: string, input = 1) => {
    console.log(timer.start(`9a - ${title}`));
    const cpu = new IntcodeComputer(data, input);
    console.log(cpu.run());
    console.log(cpu.hasMore());
    // console.log(cpu.state);
    console.log(timer.stop());
};

export const test = () => {
        // run(input.data, '5a data');
    // run(input2.data, '2a data');
    // run([109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99], 'copy of itself');
    // run([1102, 34915192, 34915192, 7, 4, 7, 99, 0], '16-digit');
    // run([104, 1125899906842624, 99], 'output middle number');
    run(input.data, 'input', 1);
};

// test();
