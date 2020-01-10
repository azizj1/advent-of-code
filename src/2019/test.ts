import { timer } from '~/util/Timer';

/*
[
    'L,10',
    'L,10',
    'R,6',
    'L,10',
    'L,10',
    'R,6',
    'R,12',
    'L,12',
    'L,12',
    'R,12',
    'L,12',
    'L,12',
    'L,6',
    'L,10',
    'R,12',
    'R,12',
    'R,12',
    'L,12',
    'L,12',
    'L,6',
    'L,10',
    'R,12',
    'R,12',
    'R,12',
    'L,12',
    'L,12',
    'L,6',
    'L,10',
    'R,12',
    'R,12',
    'L,10',
    'L,10',
    'R,6'
]
*/

const isRepeating = (substring: string[], stringArr: string[], fromIndex: number) => {
    for (let i = fromIndex; i < stringArr.length; i++) {
        let matches = true;
        for (let j = 0; j < substring.length && j < stringArr.length; j++) {
            if (substring[j] !== stringArr[i + j]) {
                matches = false;
                break;
            }
        }
        if (matches)
            return true;
    }
    return false;
};

/*
a,b,c,c,d,c,a,a,b,c,c
*/
const toFunctions = (movements: string[]) => {
    const allFunctions: string[][] = [];
    let substring: string[] = [];

    for (let i = 0; i < movements.length; i++) {
        substring.push(movements[i]);
        if (!isRepeating(substring, movements, i + 1)) {
            substring.pop();
            if (substring.length > 1)
                allFunctions.push(substring);
            substring = [];
        }
    }
    return allFunctions;
};

export const run = () => {
    console.log(timer.start('testing'));
    console.log(toFunctions(['a', 'b', 'c', 'c', 'd', 'c', 'a', 'a', 'b', 'c', 'c']));
    console.log(timer.stop());
    console.log(timer.start('input'));
    console.log(toFunctions([
        'L,10',
        'L,10',
        'R,6',
        'L,10',
        'L,10',
        'R,6',
        'R,12',
        'L,12',
        'L,12',
        'R,12',
        'L,12',
        'L,12',
        'L,6',
        'L,10',
        'R,12',
        'R,12',
        'R,12',
        'L,12',
        'L,12',
        'L,6',
        'L,10',
        'R,12',
        'R,12',
        'R,12',
        'L,12',
        'L,12',
        'L,6',
        'L,10',
        'R,12',
        'R,12',
        'L,10',
        'L,10',
        'R,6'
    ]));
    console.log(timer.stop());
};
