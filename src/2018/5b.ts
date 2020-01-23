import { willReact, getSimulations } from '~/2018/5';
import { timer } from '~/util/Timer';
import { last, declareProblem } from '~/util/util';

const react = (polymer: string) => (exclude: string) => {
    const result = [''];
    let index = 0;
    while (index < polymer.length) {
        const char = polymer.charAt(index);
        if (willReact(last(result), char))
            result.pop();
        else if (char.toUpperCase() !== exclude)
            result.push(char);
        index++;
    }
    return result.length - 1;
};

const reactWithImprovements = (polymer: string) => {
    const begin = 'A'.charCodeAt(0);
    const end = 'Z'.charCodeAt(0);
    let shortestPolymer = Infinity;
    for (let i = begin; i <= end; i++)
        shortestPolymer = Math.min(
            shortestPolymer,
            react(polymer)(String.fromCharCode(i))
        );
    return shortestPolymer;
};

export const run = () => {
    const sims = getSimulations();
    declareProblem('5b');
    for (const s of sims) {
        console.log(timer.start(`5b name=${s.name}`));
        console.log(reactWithImprovements(s.polymer));
        console.log(timer.stop());
    }
};
