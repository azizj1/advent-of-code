import { getRunsFromIniFile } from '~/util/util';
import input from './5.txt';
import { timer } from '~/util/Timer';

export const getSimulations = () => getRunsFromIniFile(input).map(ini => ({
    name: ini.name,
    polymer: ini.content.replace(/\r|\n/, '')
}));

// 'a' and 'A', and any other letter with opposite casing, will always have a diff of 32.
export const willReact = (c1: string, c2: string) => Math.abs(c2.charCodeAt(0) - c1.charCodeAt(0)) === 32;
export const destroy =
    (polymer: string) =>
    (index: number) =>
        polymer.substring(0, index - 1) + polymer.substring(index + 1);

const react = (polymer: string) => {
    let result = polymer,
        index = 1;
    while (index < result.length) {
        if (willReact(result.charAt(index), result.charAt(index - 1))) {
            result = destroy(result)(index);
            index--;
        }
        else {
            index++;
        }
    }
    return result;
};

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`5 name=${s.name}`));
        console.log(react(s.polymer).length);
        console.log(timer.stop());
    }
};
