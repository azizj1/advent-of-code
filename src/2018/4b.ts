import { getSimulations, getMinMostSlept, IRecord } from '~/2018/4';
import { timer } from '~/util/Timer';

const getRecordsPerGuard = (records: IRecord[]) => records.reduce((a, c) => {
    if (!a.has(c.guardId))
        a.set(c.guardId, []);
    a.get(c.guardId)!.push(c);
    return a;
}, new Map<number, IRecord[]>());

const getGuardMostFrequentlySleptOnSameMinute = (records: IRecord[]) =>
    Array.from(getRecordsPerGuard(records).entries()).map(([guard, records]) => ({
        guard,
        freq: getMinMostSlept(records)
    })).sort((a, b) => b.freq.frequency - a.freq.frequency)[0];

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`day 4 - name=${s.name}`));
        const details = getGuardMostFrequentlySleptOnSameMinute(s.records);
        console.log('details', details, 'ans', details.guard * details.freq.minute);
        console.log(timer.stop());
    }
};
