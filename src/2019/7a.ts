import { restore } from '~/2019/5b';
import * as input from './7.json';

const swap = <T>(arr: T[], indexA: number, indexB: number) => {
    const temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
};

export const permute = <T>(arr: T[]) => {
    const solutions: T[][] = [];
    const n = arr.length;

    const helper = (startIndex: number, current: T[]) => {
        if (startIndex === n) {
            solutions.push([...current]);
            return;
        }
        for (let i = startIndex; i < n; i++) {
            swap(current, startIndex, i);
            helper(startIndex + 1, current);
            swap(current, startIndex, i);
        }
    };
    helper(0, [...arr]);
    return solutions;
};

const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);

/*
    n is 1-index based. so 1st permutation is actually the first permutation.
    No such thing as 0th permutation
*/
export const permuteIterator = (arr: number[]) => {
    const length = arr.length;
    // so for [0, 1, 2, 3], dividers will be [3!, 2!, 1!, 0!] = [6, 2, 1, 1]
    const dividers = arr.map((_, i) => factorial(length - i - 1));
    const total = factorial(arr.length);

    let n = 1;
    return () => {
        if (n > total)
            return null;
        const permutation = [];
        const remaining = [...arr];
        for (let i = 0; i < length; i++) {
            // for the 12th permutation of [0, 1, 2, 3], it'll go like this:
            // i = 0: index = 11 / 6 % 4 = 1 % 4 = 1, take out remaining[1], so permutation = [1]
            // i = 1: index = 11 / 2 % 3 = 5 % 3 = 2, take out remaining[2], so permutation = [1, 3]
            // i = 2: index = 11 / 1 % 2 = 1 % 2 = 1, take out remaining[1], so permutation = [1, 3, 2]
            // i = 3: index = 11 / 1 % 1 = 1 % 1 = 0, take out remaining[0], so permutation = [1, 3, 2, 0]
            // SEE BELOW for other permutation examples
            const index = Math.floor((n - 1) / dividers[i]) % remaining.length;
            // take out 1 element at position index. Splice returns an array, since we're only removing 1, [0] is that
            // element.
            permutation.push(remaining.splice(index, 1)[0]);
        }
        n++;
        return permutation;
    };
};

export const getSignal = (program: number[], phases: number[]) => {
    const amplifiers = Array.from({length: 5}, () => restore(program));
    let output = 0;
    for (let i = 0; i < amplifiers.length; i++) {
        output = amplifiers[i](phases[i], output).output;
    }
    return output;
};

export const getBestPhase = (program: number[]) => {
    const phases = Array.from({length: 5}, (_, i) => i);
    const signal = [...getSignal(program, phases).toString().padStart(5, '0')];
    const output = [...signal].sort((a, b) => b.localeCompare(a)).map(s => signal.findIndex(s1 => s1 === s));
    console.log(`signal ${signal} to ${output}`);
    return output;
};

export const getBestPhase2 = (program: number[]) => {
    let phase: number[] | null = [0, 1, 2, 3, 4];
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
    const program1 = [3, 15, 3, 16, 1002, 16, 10, 16, 1, 16, 15, 15, 4, 15, 99, 0, 0];
    const program2 = [3, 23, 3, 24, 1002, 24, 10, 24, 1002, 23, -1, 23, 101, 5, 23, 23, 1, 24, 23, 23, 4, 23, 99, 0, 0];
    const program3 = [3, 31, 3, 32, 1002, 32, 10, 32, 1001, 31, -2, 31, 1007, 31, 0, 33, 1002, 33, 7, 33, 1, 33, 31,
            31, 1, 32, 31, 31, 4, 31, 99, 0, 0, 0];
    const program4 = input.data;
    const phase1 = getBestPhase2(program1);
    const phase2 = getBestPhase2(program2);
    const phase3 = getBestPhase2(program3);
    const phase4 = getBestPhase2(program4);
    console.log(getSignal(program1, phase1));
    console.log(getSignal(program2, phase2));
    console.log(getSignal(program3, phase3));
    console.log(getSignal(program4, phase4));
    console.log(getBestPhase2(program4));
};

// console.log(timer.start('7a'));
// run();
// console.log(timer.stop());
