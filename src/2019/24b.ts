import {
    makeBugAt,
    makeGetNumberOfAdjBugs,
    makeHasBugAt,
    sideLength,
    kill,
    infest,
    getSimulations,
    print
} from '~/2019/24';
import { first, last } from '~/util/util';
import { timer } from '~/util/Timer';

/*
00000
00100
01?10
00100
00000
*/
const adjToInnerMask = 0b100010100010000000;
const hasBugsAtInnerLvl = (grid: number) => (grid & adjToInnerMask) > 0;

/*
11111
10001
10001
10001
11111
*/
const perimeterMask = 0b1111110001100011000111111;
const hasBugsAtOuterLvl = (grid: number) => (grid & perimeterMask) > 0;

const isAdjToInner = (index: number) => ((1 << index) & adjToInnerMask) > 0;
const isAdjToOuter = (index: number) => ((1 << index) & perimeterMask) > 0;

const indexToInnerAdjIndices = new Map([
    [7, [0, 1, 2, 3, 4]], // above ?
    [11, [0, 5, 10, 15, 20]], // left of ?
    [13, [4, 9, 14, 19, 24]], // right of ?
    [17, [20, 21, 22, 23, 24]] // below ?
]);

// inverse of indexToInnerAdjIndices, i.e.,
// 0 -> [7, 11]
// 1 -> [7]
// 4 -> [7, 13]
// etc.
const indexToOuterAdjIndices = Array.from(indexToInnerAdjIndices.entries()).map(([k, vs]) => vs.map(v => ({k, v})))
    .reduce((a, c) => a.concat(c), [] as {k: number; v: number}[])
    .reduce((m, e) => {
        const arr = m.get(e.v) ?? [];
        arr.push(e.k);
        return m.set(e.v, arr);
    }, new Map<number, number[]>());

const makeGetNumberOfAdjBugsPlutonian =
    (grids: number[]) => // 0th grid is inner-most
    (level: number) => // current level
    (index: number) => // info about index's neighbors at level
{
    const grid = grids[level] ?? 0;
    const innerGrid = grids[level - 1] ?? 0;
    const outerGrid = grids[level + 1] ?? 0;
    let count = makeGetNumberOfAdjBugs(grid)(index);

    if (innerGrid > 0 && isAdjToInner(index))
        count += indexToInnerAdjIndices.get(index)?.map(makeBugAt(innerGrid)).reduce((a, c) => a + c, 0) ?? 0;
    if (outerGrid > 0 && isAdjToOuter(index))
        count += indexToOuterAdjIndices.get(index)?.map(makeBugAt(outerGrid)).reduce((a, c) => a + c, 0) ?? 0;
    return count;
};

const afterOneMinuteAtLvl = (grid: number, getNumOfAdjBugs: (index: number) => number) => {
    let working = grid;
    const hasBugAt = makeHasBugAt(grid);
    for (let i = 0; i < sideLength * sideLength; i++) {
        if (i === 12) // if at center
            continue;
        const adjBugs = getNumOfAdjBugs(i);
        if (hasBugAt(i) && adjBugs !== 1)
            working = kill(working, i);
        else if (!hasBugAt(i) && (adjBugs === 1 || adjBugs === 2))
            working = infest(working, i);
    }
    return working;
};

const afterOneMinute = (grids: number[]) => {
    const working = [...grids];
    const getNumberOfAdjBugs = makeGetNumberOfAdjBugsPlutonian(grids);
    for (let i = 0; i < grids.length; i++)
        working[i] = afterOneMinuteAtLvl(grids[i], getNumberOfAdjBugs(i));

    if (hasBugsAtInnerLvl(first(grids)))
        working.unshift(afterOneMinuteAtLvl(0, getNumberOfAdjBugs(-1)));
    if (hasBugsAtOuterLvl(last(grids)))
        working.push(afterOneMinuteAtLvl(0, getNumberOfAdjBugs(grids.length)));
    return working;
};

const toNumberOfBugs = (grid: number) => {
    let count = 0,
        leftoverGrid = grid;
    for (; leftoverGrid > 0; leftoverGrid >>= 1) // Equiv to leftoverGrid = leftOverGrid >> 1
        count += leftoverGrid & 1;
    return count;
};

export const bugsAfterXMinutes = (initGrid: number) => (mins: number) => {
    let grids = [initGrid];
    for (let i = 0; i < mins; i++) {
        grids = afterOneMinute(grids);
    }
    return grids.map(toNumberOfBugs).reduce((a, c) => a + c, 0);
};

export const printAfterXMinutes = (initGrid: number) => (mins: number) => {
    let grids = [initGrid];
    for (let i = 0; i < mins; i++) {
        grids = afterOneMinute(grids);
    }
    if (grids.length % 2 === 0)
        throw `Grid levels are not symmetric. Length = ${grids.length}`;
    const innerLength = (grids.length - 1) / 2;
    grids.reverse().forEach((g, i) => {
        console.log(`Depth ${-innerLength + i}`);
        print(g);
    });
};

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`24b - ${s.name}`));
        console.log(bugsAfterXMinutes(s.grid)(s.iterations));
        console.log(timer.stop());
    }
};
