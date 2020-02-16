import { getPowerLevels } from '~/2018/11';
import { IPoint, toKey, add } from '~/2019/10';
import { declareProblem } from '~/util/util';
import { runAg, getLargestPowerAndSize2 } from '~/2018/11b';

const primeTable = [2, 3, 5, 7, 11, 13, 17, 19];
// Start by dividing N by the smallest prime numbers. If N is divisible by, say 5,
// then the largest divisor of N is N / 5.
// E.g., if the number is 250. Largest divisor of 250 is 250 / 5 = 50
const getLargestDivisor = (n: number) => {
    const max = Math.floor(Math.sqrt(n));
    for (let i = 0; primeTable[i] <= max; i++) {
        if (n % primeTable[i] === 0)
            return n / primeTable[i];
    }
    return n;
};

export const getLargestDivisorsOddNumbers = (allNumbersUntil: number) => {
    if (allNumbersUntil > 300)
        throw 'Only supported for numbers 300 or less';
    const largestDivisors = new Map<number, number>();
    for (let i = 9; i < 300; i += 2) // only odd numbers
        largestDivisors.set(i, getLargestDivisor(i));

    return largestDivisors;
};

export const getLargestPowerAndSize4 = (serial: number) => {
    const maxSide = 300;
    // col,row,size -> powerLevel
    // initially, it stores col,row,1 (i.e., power levels at individual cells),
    // which is 90,000 entries.
    const cache = new Map(
        Array.from(getPowerLevels({height: maxSide, width: maxSide}, serial).entries())
            .map(([p, v]) => [`${p},1`, v])
    );
    const largestDivisors = getLargestDivisorsOddNumbers(300);

    const divideConquer = (size: number, from: IPoint): number => {
        const cacheKey = `${toKey(from)},${size}`;
        if (cache.has(cacheKey))
            return cache.get(cacheKey)!;

        if (size % 2 === 0) {
            const quarterSize = size / 2;
            const powerLevel =
                divideConquer(quarterSize, from) +
                divideConquer(quarterSize, add(from)({row: quarterSize, col: 0})) +
                divideConquer(quarterSize, add(from)({row: 0, col: quarterSize})) +
                divideConquer(quarterSize, add(from)({row: quarterSize, col: quarterSize}));
            cache.set(cacheKey, powerLevel);
            return powerLevel;
        }
        // the largestDivisors.get(size) !== size is important to avoid infinite loops
        // because a prime, say 11, its largest divisor is itself: 11
        else if (largestDivisors.has(size) && largestDivisors.get(size) !== size) {
            const smallerSize = largestDivisors.get(size)!;
            const iterations = size / smallerSize;

            let powerLevel = 0;
            for (let i = 0; i < iterations; i++) {
                for (let j = 0; j < iterations; j++)
                    powerLevel += divideConquer(
                        smallerSize,
                        add(from)({row: i * smallerSize, col: j * smallerSize})
                    );
            }
            cache.set(cacheKey, powerLevel);
            return powerLevel;
        }
        // this section should now only execute for the 62 primes that are less
        // than 300
        const smallerSize = size - 1;
        let powerLevel = divideConquer(smallerSize, from);
        // add bottom row
        for (let i = 0; i < size; i++)
            powerLevel += cache.get(`${toKey(add(from)({row: smallerSize, col: i}))},1`)!;

        // add right column
        for (let i = 0; i < smallerSize; i++)
            powerLevel += cache.get(`${toKey(add(from)({row: i, col: smallerSize}))},1`)!;

        cache.set(cacheKey, powerLevel);
        return powerLevel;
    };

    // return divideConquer(10, {row: 1, col: 1});
    let maxPower = 0;
    let maxPowerStart = {row: 0, col: 0};
    let maxPowerSize = 300;
    for (let s = 2; s <= maxSide; s++) {
        let maxPowerForSize = 0;
        for (let i = 1; i <= maxSide - s + 1; i++) {
            for (let j = 1; j <= maxSide - s + 1; j++) {
                const powerLevel = divideConquer(s, {row: i, col: j});
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

export const run = () => {
    declareProblem('2018 11b EXTRA');
    [{
        f: getLargestPowerAndSize4,
        n: 'divide conquer more evenly'
    }, {
        f: getLargestPowerAndSize2,
        n: 'divide conquer not evenly'
    }].forEach(a => runAg(a.f, a.n));
};
