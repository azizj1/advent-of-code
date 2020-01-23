import { willReact, destroy } from '~/2018/5';
import { getSimulations } from '~/2018/5';
import { timer } from '~/util/Timer';

export const remove =
    (polymer: string) =>
    (index: number) =>
        polymer.substring(0, index) + polymer.substring(index + 1);

const react = (polymer: string) => (exclude: string[]) => {
    let result = polymer,
        index = 1;
    while (index < result.length) {
        if (exclude.includes(result.charAt(index)))
            result = remove(result)(index);
        else if (willReact(result.charAt(index), result.charAt(index - 1))) {
            result = destroy(result)(index);
            index--;
        }
        else
            index++;
    }
    return result;
};

const reactWithImprovements = (polymer: string) => {
    const begin = 'A'.charCodeAt(0);
    const end = 'Z'.charCodeAt(0);
    let shortestPolymer = Infinity;
    for (let i = begin; i <= end; i++)
        shortestPolymer = Math.min(
            shortestPolymer,
            react(polymer)([String.fromCharCode(i), String.fromCharCode(i + 32)]).length
        );
    return shortestPolymer;
};

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`5 name=${s.name}`));
        console.log(reactWithImprovements(s.polymer));
        console.log(timer.stop());
    }
};
