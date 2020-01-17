import { makeBugAt, makeGetNumberOfAdjBugs } from '~/2019/24';

/*
00000
00100
01?10
00100
00000
*/
const adjToInnerMask = 0b100010100010000000;
export const hasBugsAtInnerLvl = (grid: number) => (grid & adjToInnerMask) > 0;

/*
11111
10001
10001
10001
11111
*/
const perimeterMask = 0b1111110001100011000111111;
export const hasBugsAtOuterLvl = (grid: number) => (grid & perimeterMask) > 0;

export const isAdjToInner = (grid: number) => (index: number) => ((grid & (1 << index)) & adjToInnerMask) > 0;
export const isAdjToOuter = (grid: number) => (index: number) => ((grid & (1 << index)) & perimeterMask) > 0;

const indexToInnerAdjIndices = new Map([
    [7, [0, 1, 2, 3, 4]],
    [11, [0, 5, 10, 15, 20]],
    [13, [4, 9, 14, 19, 24]],
    [17, [20, 21, 22, 23, 24]]
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

export const makeGetNumberOfAdjBugsPlutonian =
    (grids: Map<number, number>) => // maps from level -> grid
    (level: number) => // current level
    (index: number) => // index to get
{
    const grid = grids.get(level) ?? 0;
    const innerGrid = grids.get(level + 1) ?? 0;
    const outerGrid = grids.get(level - 1) ?? 0;
    if (grid === 0) // no bugs
        return 0;
    let count = makeGetNumberOfAdjBugs(grid)(index);

    if (innerGrid > 0 && isAdjToInner(grid)(index))
        count += indexToInnerAdjIndices.get(index)?.map(makeBugAt(innerGrid)).reduce((a, c) => a + c, 0) ?? 0;
    if (outerGrid > 0 && isAdjToOuter(grid)(index))
        count += indexToOuterAdjIndices.get(index)?.map(makeBugAt(outerGrid)).reduce((a, c) => a + c, 0) ?? 0;
    return count;
};

export const run = () => {
    console.log(indexToOuterAdjIndices);
};
