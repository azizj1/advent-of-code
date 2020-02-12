import { declareProblem } from '~/util/util';
import { getSimulations, makeGetLargestPower, ISize, getPowerLevels } from '~/2018/11';
import { timer } from '~/util/Timer';
import { IPoint, toKey, add } from '~/2019/10';

const getLargestPowerAndSize = (serial: number) => {
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

const getLargestPowerAndSize2 = (serial: number) => {
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
};

export const run = () => {
    declareProblem('2018 11b');
    for (const s of getSimulations()) {
        console.log(timer.start(`name=${s.name},serial=${s.serial}`));
        console.log(getLargestPowerAndSize(s.serial));
        console.log(timer.stop());
    }
};
