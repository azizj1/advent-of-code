import { timer } from '~/util/Timer';

export const isValid = (n: number) => {
    const nArray = n.toString().split('').map(Number);
    const countOfEachNumber = new Map<number, number>();
    countOfEachNumber.set(nArray[0], 1);
    for (let i = 1; i < nArray.length; i++) {
        if (nArray[i] < nArray[i - 1])
            return false;
        countOfEachNumber.set(nArray[i], (countOfEachNumber.get(nArray[i]) ?? 0) + 1);
    }
    return Array.from(countOfEachNumber.values()).find(c => c === 2) != null;
};

export const ans = (min: number, max: number) => {
    let count = 0;
    for (let i = min; i <= max; i++)
        if (isValid(i))
            count++;
    return count;
};

console.log(timer.start('4b'));
console.log(ans(278384, 824795));
console.log(timer.stop());
