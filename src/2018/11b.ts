import { declareProblem, declareSubproblem } from '~/util/util';
import { getSimulations, makeGetLargestPower, getPowerLevels, ISize, makeGetPower } from '~/2018/11';
import { timer } from '~/util/Timer';
import { IPoint, toKey, add } from '~/2019/10';

// O(n^5)
export const getLargestPowerAndSize = (serial: number) => {
    const getLargestPower = makeGetLargestPower({height: 300, width: 300}, serial);
    let maxPower = {coordinate: 'null', power: -1};
    let maxSize = 1;

    for (let size = 1; size <= 300; size++) {
        console.log(`at size = ${size}`);
        const currPower = getLargestPower({height: size, width: size});
        if (currPower.power > maxPower.power) {
            maxPower = currPower;
            maxSize = size;
        }
    }

    return `${maxPower.coordinate},${maxSize}`;
};

// O(n^4)
export const getLargestPowerAndSize2 = (serial: number) => {
    const maxSide = 300;
    // col,row,size -> powerLevel
    const cache = new Map(
        Array.from(getPowerLevels({height: maxSide, width: maxSide}, serial).entries())
            .map(([p, v]) => [`${p},1`, v])
    );
    const helper = (size: number, from: IPoint): number => {
        const cacheKey = `${toKey(from)},${size}`;
        if (cache.has(cacheKey))
            return cache.get(cacheKey)!;

        if (from.row + size > maxSide || from.col + size > maxSide)
            return -Infinity;

        if (size % 2 === 0) {
            const quarterSize = size / 2;
            const powerLevel =
                helper(quarterSize, from) +
                helper(quarterSize, add(from)({row: quarterSize, col: 0})) +
                helper(quarterSize, add(from)({row: 0, col: quarterSize})) +
                helper(quarterSize, add(from)({row: quarterSize, col: quarterSize}));
            cache.set(cacheKey, powerLevel);
            return powerLevel;
        }
        const smallerSize = size - 1;
        let powerLevel = helper(smallerSize, from);
        // add bottom row
        for (let i = 0; i < size; i++)
            powerLevel += cache.get(`${toKey(add(from)({row: smallerSize, col: i}))},1`)!;

        // add right column
        for (let i = 0; i < smallerSize; i++)
            powerLevel += cache.get(`${toKey(add(from)({row: i, col: smallerSize}))},1`)!;

        cache.set(cacheKey, powerLevel);
        return powerLevel;
    };

    let maxPower = 0;
    let maxPowerStart = {row: 0, col: 0};
    let maxPowerSize = 300;
    for (let s = 1; s <= 300; s++) {
        let maxPowerForSize = 0;
        for (let i = 1; i <= maxSide - s + 1; i++) {
            for (let j = 1; j <= maxSide - s + 1; j++) {
                const powerLevel = helper(s, {row: i, col: j});
                if (powerLevel > maxPower) {
                    maxPower = powerLevel;
                    maxPowerStart = {row: i, col: j};
                    maxPowerSize = s;
                }
                if (powerLevel > maxPowerForSize)
                    maxPowerForSize = powerLevel;
            }
        }
        if (maxPowerForSize === 0)
            break;
         console.log('cacheSize', cache.size, 'size', s, 'maxPowerForSize', maxPowerForSize);
    }
    console.log('maxPower', maxPower, 'maxPowerStart', maxPowerStart, 'maxPowerSize', maxPowerSize);
    return maxPower;
};

export const getPowerLevelsGrid = (grid: ISize, serial: number) => {
    const powerLevels = Array.from({length: grid.height + 1}, () => [0]);
    powerLevels[0] = Array.from({length: grid.width + 1}, () => 0);
    const getPower = makeGetPower(serial);
    for (let i = 1; i <= grid.height; i++)
        for (let j = 1; j <= grid.width; j++)
            powerLevels[i][j] = getPower({row: i, col: j});
    return powerLevels;
};

export const toSummedAreaTable = (powerGrid: number[][]) => {
    for (let i = 1; i < powerGrid.length; i++)
        for (let j = 1; j < powerGrid[i].length; j++)
            powerGrid[i][j] = powerGrid[i][j]
                                + powerGrid[i][j - 1] + powerGrid[i - 1][j]
                                - powerGrid[i - 1][j - 1];
    return powerGrid;
};

// O(n^3)
export const getLargestPowerAndSize3 = (serial: number) => {
    const maxSide = 300;
    let powerGrid = getPowerLevelsGrid({height: maxSide, width: maxSide}, serial);
    powerGrid = toSummedAreaTable(powerGrid);

    let maxPower = 0;
    let maxSize = 1;
    let maxStarting = {x: 0, y: 0};
    for (let s = 1; s <= maxSide; s++)
        for (let i = s; i <= maxSide; i++)
            for (let j = s; j <= maxSide; j++) {
                const power = powerGrid[i][j]
                                - powerGrid[i][j - s] - powerGrid[i - s][j]
                                + powerGrid[i - s][j - s];
                if (power > maxPower) {
                    maxPower = power;
                    maxSize = s;
                    maxStarting = {y: i, x: j};
                }
            }

    console.log('maxPower', maxPower, 'maxSize', maxSize, 'maxStarting', maxStarting);
    return maxPower;
};

export const runAg = (ag: (serial: number) => number, title: string) => {
    declareSubproblem(title);
    for (const s of getSimulations()) {
        console.log(timer.start(`name=${s.name},serial=${s.serial}`));
        console.log(ag(s.serial));
        console.log(timer.stop());
    }
};

export const run = () => {
    declareProblem('2018 11b');
    [{
        f: getLargestPowerAndSize3,
        n: 'summed area table'
    }, {
        f: getLargestPowerAndSize2,
        n: 'divide and conquer'
    }].forEach(a => runAg(a.f, a.n));
};
