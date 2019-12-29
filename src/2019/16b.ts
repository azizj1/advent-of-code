import { getRunsFromIniFile } from '~/util/util';
import input from './16.txt';
import { timer } from '~/util/Timer';

export const getPattern = (repeatPerNumber: number, i: number) => {
    const base = [0, 1, 0, -1] as const;
    return base[Math.floor((i + 1) / repeatPerNumber) % base.length];
};

export const repeat = (arr: number[], times: number) => {
    const working = [...arr];
    for (let i = 0; i < times; i++)
        for (let j = 0; j < arr.length; j++)
            working.push(arr[j]);
    return working;
};

export const fft = (signal: number[], numOfPhases: number, offset = 0, msgLength = 8) => {
    signal = repeat(signal, 10000);
    let output = signal;
    for (let i = 0; i < numOfPhases; i++) {
        const workingCopy: number[] = [];
        for (let j = 1; j <= signal.length; j++) {
            let sum = 0;
            for (let k = j - 1; k < signal.length; k++) // start at j - 1 because indices 0 to j - 1 will be all zeros.
                sum += output[k] * getPattern(j, k);
            workingCopy.push(Math.abs(sum % 10));
        }
        output = workingCopy;
    }
    return output.slice(offset, msgLength);
};

export const getSignalsFromFile = () => getRunsFromIniFile(input).map(s => ({
    name: s.name.split(',')[0],
    numofPhases: Number(s.name.split(',')[1]),
    signal: s.content.replace(/\r?\n/, '').split('').map(Number)
}));

export const run = () => {
    const sims = getSignalsFromFile().slice(-1); // .slice(0, -1);
    for (const s of sims) {
        console.log(timer.start(`16b - ${s.name}`));
        console.log(fft(s.signal, s.numofPhases));
        console.log(timer.stop());
    }
};
