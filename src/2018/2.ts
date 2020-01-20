import { getRunsFromIniFile } from '~/util/util';
import input from './2.txt';
import { timer } from '~/util/Timer';

const getSimulations = () => getRunsFromIniFile(input).map(ini => ({
    name: ini.name,
    ids: ini.content.split('\n').filter(s => s.trim() !== '')
}));

const getIdInfo = (id: string): [number, number] => {
    const letterCount = new Map<string, number>();
    let hasTwoCount = 0,
        hasThreeCount = 0;

    for (const s of id)
        letterCount.set(s, (letterCount.get(s) ?? 0) + 1);
    for (const v of letterCount.values()) {
        if (v === 2)
            hasTwoCount = 1;
        else if (v === 3)
            hasThreeCount = 1;
    }
    return [hasTwoCount, hasThreeCount];
};

const getChecksumForIds = (ids: string[]) => ids
    .reduce((a, c) => getIdInfo(c).map((c, i) => c + a[i]), [0, 0])
    .reduce((a, c) => a * c, 1);

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`2 name=${s.name}`));
        console.log(getChecksumForIds(s.ids));
        console.log(timer.stop());
    }
};
