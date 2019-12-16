import { timer } from '~/util/Timer';

export const isValid = (n: number) => {
    const nArray = n.toString().split('').map(Number);
    let hasDupes = false;
    for (let i = 1; i < nArray.length; i++) {
        if (nArray[i] < nArray[i - 1])
            return false;
        if (nArray[i] === nArray[i - 1])
            hasDupes = true;
    }
    return hasDupes;
};

export const ans = (min: number, max: number) => {
    let count = 0;
    for (let i = min; i <= max; i++)
        if (isValid(i))
            count++;
    return count;
};

console.log(timer.start('4'));
console.log(ans(278384, 824795));
console.log(timer.stop());
