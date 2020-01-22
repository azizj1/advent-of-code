import * as assert from 'assert';
import input from './4.txt';
import { getRunsFromIniNewlineSep } from '~/util/util';
import { timer } from '~/util/Timer';

export interface IRecord {
    sleptAt: Date;
    wokeUpAt: Date;
    guardId: number;
    duration: number;
}

const getGuardId = (event: string) => event?.match(/Guard #(\d+)/)?.map(Number)?.[1];

export const getSimulations = () => getRunsFromIniNewlineSep(input)
    .map(({name, content}) => ({
        name,
        events: content
            .map(c => {
                const [, fullDate, year, month, day, hour, min, text] =
                    c.match(/^\(((\d+)-(\d+)-(\d+) (\d+):(\d+))\) (.+)$/) ?? [];
                return {
                    fullDate,
                    date: new Date(Date.UTC(Number(year) + 500, Number(month), Number(day), Number(hour), Number(min))),
                    event: text
                };
            })
            .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
    }))
    .map(({name, events}) => {
        const records: IRecord[] = [];
        let guardId = getGuardId(events[0].event);
        assert.notEqual(guardId, null);
        for (let i = 1; i < events.length; i++) {
            if (events[i].event === 'falls asleep' && events[i + 1].event === 'wakes up') {
                records.push({
                    sleptAt: events[i].date,
                    wokeUpAt: events[i + 1].date,
                    guardId: guardId!,
                    duration: Math.floor((events[i + 1].date.getTime() - events[i].date.getTime()) / 1000 / 60)
                });
                i++;
            }
            else if ((guardId = getGuardId(events[i].event)) == null) {
                throw `Unable to parse guard ID from events[${i}] = ${JSON.stringify(events[i])}`;
            }
        }
        return {
            name,
            records
        };
    });

const getMostSleepyGuard = (records: IRecord[]) => {
    const guardToTimeSlept = new Map<number, number>();
    let mostSleepyGuard = -1;
    for (const record of records) {
        const soFar = guardToTimeSlept.get(record.guardId) ?? 0;
        const contender = guardToTimeSlept.get(mostSleepyGuard) ?? 0;
        guardToTimeSlept.set(record.guardId, soFar + record.duration);

        if (contender < soFar + record.duration)
            mostSleepyGuard = record.guardId;
    }
    return mostSleepyGuard;
};

export const getMinMostSlept = (relevant: IRecord[]) => {
    const minsFrequency = Array(60).fill(0); // index is min, value is frequency

    const fill = (startMin: number, duration: number) => {
        for (let i = 0; i < duration; i++)
            minsFrequency[startMin + i]++;
    };

    for (const r of relevant)
        fill(r.sleptAt.getMinutes(), r.duration);
    let minsMostSlept = 0;
    for (let i = 1; i < minsFrequency.length; i++)
        if (minsFrequency[i] > minsFrequency[minsMostSlept])
            minsMostSlept = i;
    return {
        minute: minsMostSlept,
        frequency: minsFrequency[minsMostSlept]
    };
};

const getTotalGuards = (records: IRecord[]) => new Set(records.map(r => r.guardId)).size;

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`day 4 - name=${s.name}`));
        const guard = getMostSleepyGuard(s.records);
        const minsMostSlept = getMinMostSlept(s.records.filter(r => r.guardId === guard));
        console.log('total guards', getTotalGuards(s.records));
        console.log('guard', guard, 'mins most slept', minsMostSlept, 'ans', guard * minsMostSlept.minute);
        console.log(timer.stop());
    }
};
