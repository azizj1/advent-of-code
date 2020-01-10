import { IntcodeComputer } from '~/2019/9';
import * as input from './19.json';
import { last } from '~/util/util';
import { timer } from '~/util/Timer';
import { toString } from '~/2019/17';

export const getGrid = (comp: IntcodeComputer, height: number) => {
    const grid: string[][] = [];
    for (let i = 0; i < height; i++) {
        grid[i] = [];
        let j = 0,
            output = 0;
        while (output === 0) {
            output = comp.run(i, j);
            comp.reset();
            grid[i][j] = '.';
            j++;
        }
        j--;
        while (output === 1) {
            output = comp.run(i, j);
            comp.reset();
            grid[i][j] = '#';
            j++;
        }
        j--;
        grid[i][j] = '.';
    }
    return grid;
};

export const getOnesPerRow = (comp: IntcodeComputer, height: number) => {
    const onesPerRow: [number, number][] = [];
    for (let i = 0; i < height; i++) {
        let output = 0,
            start = -1,
            end = -1,
            j = last(onesPerRow)?.[0] ?? 0;
        while (output === 0) {
            output = comp.run(i, j);
            comp.reset();
            j++;
        }
        j--;
        start = j;
        while (output === 1) {
            output = comp.run(i, j);
            comp.reset();
            j++;
        }
        j--;
        end = j - 1;
        onesPerRow[i] = [start, end];
    }
    return onesPerRow;
};

const getEndIndex = (rowIndex: number) =>
    2 * rowIndex +
    Math.floor(rowIndex / 23) +
    Math.floor(rowIndex / 413) * Math.floor((rowIndex - 390) % 23 === 0 ? 1 : 0);

const getStartIndex = (rowIndex: number) => {
    const threeFiftyFiveToggle = rowIndex > 0 && (rowIndex % 355 === 0 || rowIndex % 559 === 0) ? 1 : 0;
    const fiftyOffset = 3 * Math.floor(rowIndex / 51);
    const rotateOffset = Math.floor((rowIndex + fiftyOffset) / 8);
    const totaloffset = Math.floor((rowIndex + rotateOffset) / 3);
    return 2 * rowIndex - totaloffset - threeFiftyFiveToggle;
};

const getOnesPerRowWithEquation = (height: number) => {
    const onesPerRow: [number, number][] = [];
    for (let i = 0; i < height; i++)
        onesPerRow.push([getStartIndex(i), getEndIndex(i)]);
    return onesPerRow;
};

const equals = (a: [number, number][], b: [number, number][]) => {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) {
            console.log(`${a[i]} != ${b[i]}, index = ${i}`);
            // return false;
        }
    return true;
};

const getPattern = (seq: [number, number][]) => {
    const patterns: number[] = [];
    let currentIndex = 0;
    for (let i = 1; i < seq.length; i++)
        if (seq[i][0] - seq[i - 1][0] === 1) {
            patterns.push(i - currentIndex);
            currentIndex = i;
        }
    return patterns.reduce((a, c, i) => {
        const groupIndex = Math.floor(i / 3);
        if (a[groupIndex] == null)
            a[groupIndex] = [];
        a[Math.floor(i / 3)].push(c);
        return a;
    }, [] as number[][]).map(g => g.join(''));
};

export const test = () => {
    const height = 33;
    console.log(input.data.length);
    const comp = new IntcodeComputer(input.data);
    console.log(timer.start());
    const expected = getOnesPerRow(comp, height);
    console.log(timer.stop());
    const actual = getOnesPerRowWithEquation(height);
    console.log(toString(getGrid(comp, height), ''));
    console.log(expected.map(([s, e], i) => `i: ${i}\tstart: ${s}\tend: ${e}  \tsize=${e - s + 1}`).join('\n'));
    console.log('\n===EQUATION TIME====\n');
    console.log(actual.map(([s, e], i) => `i: ${i}\tstart: ${s}\tend: ${e}  \tsize=${e - s + 1}`).join('\n'));
    console.log('are equal?', equals(expected, actual));
    console.log('\n=====PATTERN (EXPECTED   ACTUAL)====\n');
    const actualPattern = getPattern(actual);
    console.log(getPattern(expected).map((e, i) => `${e}\t${actualPattern[i]}`).join('\n'));
};

export const whenOverlap = (side: number) => {
    let start = 0,
        end = 0,
        i = side;
    while (end - start < side) {
        start = getStartIndex(i);
        end = getEndIndex(i);
        i++;
    }

    while (end - getStartIndex(i + side - 1) !== side - 1) {
        i++;
        start = getStartIndex(i);
        end = getEndIndex(i);
        console.log('start', start, 'end', end, 'i', i, 'overlap', end - getStartIndex(i + side - 1));
    }
    return {
        start,
        end,
        size: end - start + 1,
        overlap: end - getStartIndex(i + side - 1),
        i,
        startForBottom: getStartIndex(i + side - 1),
        y: i,
        x: getStartIndex(i + side - 1)
    };
};

export const whenOverlapUsingComp = (comp: IntcodeComputer, side: number) => {
    const expected = getOnesPerRow(comp, side * 8);
    const getStartIndex = (ind: number) => expected[ind][0];
    const getEndIndex = (ind: number) => expected[ind][1];
    let start = 0,
        end = 0,
        i = side;
    while (end - start < side) {
        start = getStartIndex(i);
        end = getEndIndex(i);
        i++;
    }

    while (end - getStartIndex(i + side - 1) !== side - 1) {
        i++;
        start = getStartIndex(i);
        end = getEndIndex(i);
        console.log('start', start, 'end', end, 'i', i, 'overlap', end - getStartIndex(i + side - 1));
    }
    return {
        start,
        end,
        size: end - start + 1,
        overlap: end - getStartIndex(i + side - 1),
        i,
        startForBottom: getStartIndex(i + side - 1),
        y: i,
        x: getStartIndex(i + side - 1)
    };
};

export const run = () => {
    console.log(timer.start('whenOverlap'));
    // const comp = new IntcodeComputer(input.data);
    console.log(whenOverlap(100));
    console.log(getEndIndex(622));
    console.log(getStartIndex(722));
    console.log(timer.stop());
    // console.log(toString(getGrid(comp, 800), ''));
};
