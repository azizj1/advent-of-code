import { getRunsFromIniFile } from '~/util/util';
import input from './21.txt';
import { IntcodeComputer } from '~/2019/9';

const getProgram = () =>
    getRunsFromIniFile(input)
        .map(v => v.content)[0]
        .replace(/\r?\n/, '')
        .split(',')
        .map(v => parseInt(v, 10));

export const run = () => {
    const comp = new IntcodeComputer(getProgram());
    const cmds = ['NOT A J', 'NOT B T', 'OR T J', 'OR C T', 'AND T J', 'WALK'];
    comp.setInput(...[...cmds.join('\n')].map(s => s.charCodeAt(0)).concat([10]));
    let output = '';
    while (comp.hasMore())
        output += String.fromCharCode(comp.run());
    console.log(output);
};
