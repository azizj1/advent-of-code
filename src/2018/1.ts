import input from './1.txt';
import { getRunsFromIniFile } from '~/util/util';
import { timer } from '~/util/Timer';

export const freqChanges = () => getRunsFromIniFile(input).map(ini => ({
    name: ini.name,
    freq: ini.content.split('\n').filter(s => s !== '').map(Number)
}));

export const run = () => {
    const sims = freqChanges();
    for (const s of sims) {
        console.log(timer.start(`1 - ${s.name}`));
        console.log(s.freq.reduce((a, c) => a + c, 0));
        console.log(timer.stop());
    }
};
