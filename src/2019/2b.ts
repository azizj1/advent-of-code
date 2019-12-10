import { timer } from '~/util/Timer';

export const restore = (noun: number, verb: number) => 614400 * noun + verb + 644274;
export const restoreInverse = (output: number) => {
    const b = 644274;
    const a = 614400;
    const noun = Math.floor((output - b) / a);
    const verb = (output - b) % a;
    return [noun, verb];
};
export const ans = (output: number) => {
    const [noun, verb] = restoreInverse(output);
    return noun * 100 + verb;
}

console.log(timer.start('2b'));
console.log(restore(0, 0));
console.log(restore(1, 0));
console.log(restore(3, 0));
console.log(restoreInverse(19690720));
console.log(ans(19690720));
console.log(timer.stop());
