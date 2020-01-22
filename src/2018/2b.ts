import { getSimulations } from '~/2018/2';
import { timer } from '~/util/Timer';
import { promises as fs } from 'fs';

const getNthGenericForm = (id: string, n: number) => id.substring(0, n) + '*' + id.substring(n + 1);

export const corpusToGeneric = (ids: string[]) => {
    const map = new Map<string, number>();

    for (let i = 0; i < ids.length; i++)
        for (let j = 0; j < ids[i].length; j++) {
            const generic = getNthGenericForm(ids[i], j);
            map.set(generic, (map.get(generic) ?? 0) + 1);
            if (map.get(generic)! > 1)
                return generic.replace(/\*/, '');
        }
    return '';
};

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`2b name=${s.name}`));
        console.log(corpusToGeneric(s.ids));
        console.log(timer.stop());
    }
};

export const perfTest = async () => {
    const files = (await fs.readdir('src/2018/day2')).slice(0, -1);
    for (let i = 0; i < files.length; i++) {
        const bigInput = await import(/* webpackChunkName: "2018-day2-perfTest" */ `./day2/${files[i]}`);
        const ids = bigInput.default.split(/\r?\n/).filter((s: string) => s.trim() !== '');
        console.log(timer.start(`2018 day 2 performance test files=${files[i]}`));
        console.log(corpusToGeneric(ids));
        console.log(timer.stop());
    }
};
