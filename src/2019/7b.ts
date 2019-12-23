import { command, getModes } from '~/2019/5b';
import { permuteIterator } from '~/2019/7a';
import * as input from './7.json';
import { timer } from '~/util/Timer';
import { last } from '~/util/util';

export class Amplifier {
    private program: number[];
    private originalProgram: number[];
    private lastOutput: number;
    private nextIndex: number;

    constructor(program: number[]) {
        this.program = [...program];
        this.originalProgram = [...program];
        this.lastOutput = 0;
        this.nextIndex = 0;
    }

    run(...inputs: number[]) {
        let i = this.nextIndex;
        let inputIndex = 0;
        while (i < this.program.length) {
            const { opcode, modes } = getModes(this.program[i]);
            const { output, next, nextInput } = command[opcode](this.program)(i, modes, inputs[inputIndex]);
            if (!isNaN(output)) {
                this.lastOutput = output;
                this.nextIndex = next;
                return { output, exit: false };
            }
            if (opcode === '9') {
                this.nextIndex = 0;
                return { output: NaN, exit: true };
            }
            if (nextInput)
                inputIndex++;
            i = next;
        }
        return { output: NaN, exit: false, next: NaN };
    }

    get output() {
        return this.lastOutput;
    }

    get state() {
        return this.program;
    }

    reset() {
        this.program = [...this.originalProgram];
        this.lastOutput = 0;
        this.nextIndex = 0;
    }
}

export const getSignal = (program: number[], phases: number[]) => {
    const n = 5;
    const amplifiers = Array.from({length: n}, () => new Amplifier(program));
    let output = 0,
        exit = false,
        i = 0;
    while (!exit) {
        const index = i++ % n;
        const result = amplifiers[index].run(...i > n ? [output] : [phases[index], output]);
        output = result.output;
        exit = result.exit;
    }
    return last(amplifiers).output;
};

export const getBestPhase = (program: number[]) => {
    const phases = Array.from({length: 5}, (_, i) => i + 5);
    const signal = [...getSignal(program, phases).toString().padStart(5, '0')];
    const output = [...signal].sort((a, b) => b.localeCompare(a)).map(s => signal.findIndex(s1 => s1 === s));
    return output;
};

export const getBestPhase2 = (program: number[]) => {
    let phase: number[] | null = [5, 6, 7, 8, 9];
    const nextPhase = permuteIterator(phase);

    let maxOutput = 0;
    let bestPhase: number[] = phase;
    while ((phase = nextPhase()) != null) {
        const output = getSignal(program, phase);
        if (output > maxOutput) {
            maxOutput = output;
            bestPhase = [...phase];
        }
    }
    return bestPhase;
};

export const run = () => {
    // const program1 = [3, 26, 1001, 26, -4, 26, 3, 27, 1002, 27, 2, 27, 1, 27, 26, 27, 4, 27, 1001, 28, -1, 28, 1005,
    //     28, 6, 99, 0, 0, 5];
    // const program2 = [3, 52, 1001, 52, -5, 52, 3, 53, 1, 52, 56, 54, 1007, 54, 5, 55, 1005, 55, 26, 1001, 54,
    //     -5, 54, 1105, 1, 12, 1, 53, 54, 53, 1008, 54, 0, 55, 1001, 55, 1, 55, 2, 53, 55, 53, 4,
    //     53, 1001, 56, -1, 56, 1005, 56, 6, 99, 0, 0, 0, 0, 10];
    const program4 = input.data;
    const phase4 = getBestPhase2(program4);
    // const phase2 = getBestPhase2(program2);
    // const phase4 = getBestPhase2(program4);
    // console.log(getSignal(program1, phase1));
    // console.log(getSignal(program2, phase2));
    console.log(getSignal(program4, phase4));
};

console.log(timer.start('7b'));
run();
console.log(timer.stop());
