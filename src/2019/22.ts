import input from './22.txt';
import { getRunsFromIniFile, first } from '~/util/util';
import { timer } from '~/util/Timer';
import chalk from 'chalk';

export const set = (arr: number[], index: number, value: number) => {
    arr[index] = value;
    return arr;
};

export const getDeck = (length: number) => Array.from({length}, (_, i) => i);
export const newStack = (deck: number[]) => deck.reverse();
export const cut = (n: number) => (deck: number[]) => deck.slice(n).concat(deck.slice(0, n));
export const increment = (n: number) => (deck: number[]) =>
    deck.reduce((a, c, i) => set(a, n * i % deck.length, c), [] as number[]);

const toTechnique = (s: string) => {
    if (s.indexOf('stack') >= 0)
        return newStack;
    if (s.indexOf('increment') >= 0)
        return increment(Number(first(s.match(/-?\d+/g) ?? [])));
    if (s.indexOf('cut') >= 0)
        return cut(Number(first(s.match(/-?\d+/g) ?? [])));
    throw new Error('Technique not found');
};

export const getSimulations = () => getRunsFromIniFile(input).map(ini => ({
    name: ini.name.split(',')[0],
    size: Number(ini.name.split(',')[1]),
    techniques: ini.content.split('\n').filter(s => s.trim() !== '').map(toTechnique)
}));

export const run = () => {
    const sims = getSimulations().slice(1, 2);
    for (const s of sims) {
        console.log(timer.start(`22 - ${s.name} (size ${chalk.red(s.size + '')} techniques ${chalk.red(s.techniques.length + '')})`));
        const shuffled = s.techniques.reduce((a, c) => c(a), getDeck(s.size));
        if (s.name === 'input')
            console.log(shuffled.indexOf(2019));
        console.log(shuffled);
        console.log(timer.stop());
    }
};
