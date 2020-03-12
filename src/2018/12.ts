import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './12.txt';
import { timer } from '~/util/Timer';

interface ISimulation {
    initial: string[];
    notes: Map<string, string>;
    startAt: number;
}

const getSimulations = () => getRunsFromIniNewlineSep(input).map(s => ({
    initial: s.name.split(''),
    notes: new Map(s.content.map(c => c.split(' => ') as [string, string])),
    startAt: 0
}));

const makeWillGrowAt = ({initial, notes}: ISimulation) => (index: number) => {
    const subset = initial.slice(
        Math.max(index - 2, 0),
        Math.max(index + 3, 0)
    ).join('');
    if (index < 2)
        return notes.get(subset.padStart(5, '.')) === '#';
    else
        return notes.get(subset.padEnd(5, '.')) === '#';
};

const toNextGeneration = (s: ISimulation) => {
    const { initial, startAt, notes } = s;
    const next: string[] = [];
    const willGrowAt = makeWillGrowAt(s);
    const nextStartAt = startAt + (willGrowAt(-2) ? -2 : willGrowAt(-1) ? -1 : 0);

    if (willGrowAt(-2))
        next.push('#');
    if (willGrowAt(-1))
        next.push('#');
    if (willGrowAt(-2) && !willGrowAt(-1))
        next.push('.');

    for (let i = 0; i < initial.length; i++) {
        next.push(willGrowAt(i) ? '#' : '.');
    }

    if (willGrowAt(initial.length))
        next.push('#');
    if (willGrowAt(initial.length + 1)) {
        if (!willGrowAt(initial.length))
            next.push('.');
        next.push('#');
    }

    return {
        notes,
        initial: next,
        startAt: nextStartAt
    };
};

const afterNGenerations = (s: ISimulation, n: number) => {
    let generation = s;
    for (let i = 0; i < n; i++)
        generation = toNextGeneration(generation);
    return generation;
};

const print = (s: ISimulation) => {
    const lastSim = afterNGenerations(s, 50000000000);
    console.log('last set of plants', lastSim.initial.join(''));
    console.log(lastSim.startAt);
    const score = lastSim.initial.reduce((s, p, i) => s + (p === '#' ? (lastSim.startAt + i) : 0), 0);
    console.log(score);
};

export const run = () => {
    for (const s of getSimulations())
        timer.run(print, s.initial.join(''), s);
};
