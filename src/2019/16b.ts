import { getRunsFromIniFile } from '~/util/util';
import input from './16.txt';
import { timer } from '~/util/Timer';

export const getPattern = (repeatPerNumber: number, i: number) => {
    const base = [0, 1, 0, -1] as const;
    return base[Math.floor((i + 1) / repeatPerNumber) % base.length];
};

export const fft = (signal: number[], numOfPhases: number, repeatSignal = 10000, offset = 0, msgLength = 8) => {
    let output: number[] = [];
    let sum = 0;
    for (let i = signal.length * repeatSignal - 1; i >= offset; i--) {
        sum += signal[i % signal.length];
        output.push(sum % 10);
    }

    output.reverse();
    for (let i = 1; i < numOfPhases; i++) {
        const working: number[] = [];
        sum = 0;
        for (let j = output.length - 1; j >= 0; j--) {
            sum += output[j];
            working[j] = sum % 10;
        }
        output = working;
    }
    return output.slice(0, msgLength);
};

export const getSignalsFromFile = () => getRunsFromIniFile(input).map(s => ({
    name: s.name.split(',')[0],
    numofPhases: Number(s.name.split(',')[1]),
    offset: Number(s.name.split(',')[2]),
    signal: s.content.replace(/\r?\n/, '').split('').filter(s => s.trim() !== '').map(Number)
}));

export const run = () => {
    const sims = getSignalsFromFile().slice(-1); // .slice(0, -1);
    for (const s of sims) {
        console.log(timer.start(`16b name=${s.name} offset=${s.offset.toLocaleString()} - signal=${s.signal.length.toLocaleString()} digits (${(s.signal.length * 10_000).toLocaleString()})`));
        console.log(fft(s.signal, s.numofPhases, 10000, s.offset).join(''));

        console.log(timer.stop());
    }
};
