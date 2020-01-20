import { timer } from '~/util/Timer';
import { freqChanges } from './1';

const getFirstRepeatedFreq = (freq: number[]) => {
    let sum = 0;
    const set = new Set([0]);
    let i = -1;
    while (i++ < Number.MAX_SAFE_INTEGER) {
        sum += freq[i % freq.length];
        if (set.has(sum))
            return sum;
        set.add(sum);
    }
    return Infinity;
};

export const run = () => {
    const sims = freqChanges();
    for (const s of sims) {
        console.log(timer.start(`1 - ${s.name}`));
        console.log(getFirstRepeatedFreq(s.freq));
        console.log(timer.stop());
    }
};
