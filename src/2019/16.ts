import { getRunsFromIniFile } from '~/util/util';
import input from './16.txt';
import { timer } from '~/util/Timer';

export const getPattern = (repeatPerNumber: number, until: number) => {
    const base = [0, 1, 0, -1] as const;
    const result: typeof base[number][] = [];
    let resultIndex = 0;
    while (result.length < until) {
        const baseIndex = resultIndex % base.length;
        const offset = resultIndex === 0 ? 1 : 0;

        for (let i = 0; i < repeatPerNumber - offset && result.length < until; i++) {
            result.push(base[baseIndex]);
        }
        resultIndex++;
    }
    return result;
};

export const fft = (signal: number[], numOfPhases: number) => {
    let output = [...signal];
    for (let i = 0; i < numOfPhases; i++) {
        const workingCopy: number[] = [];
        for (let j = 1; j <= signal.length; j++) {
            const pattern = getPattern(j, signal.length);
            const sumProduct = output.reduce((a, c, i) => a + c * pattern[i], 0);
            workingCopy.push(Math.abs(sumProduct % 10));
        }
        output = workingCopy;
    }
    return output.slice(0, 8);
};

export const getSignalsFromFile = () => getRunsFromIniFile(input).map(s => ({
    name: s.name.split(',')[0],
    numofPhases: Number(s.name.split(',')[1]),
    signal: s.content.replace(/\r?\n/, '').split('').map(Number)
}));

export const run = () => {
    const sims = getSignalsFromFile().slice(-1); // .slice(0, -1);
    for (const s of sims) {
        console.log(timer.start(`16 - ${s.name}`));
        console.log(fft(s.signal, s.numofPhases));
        console.log(timer.stop());
    }
};
