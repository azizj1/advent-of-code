import { getRunsFromIniFile } from '~/util/util';
import input from './21.txt';
import { IntcodeComputer } from '~/2019/9';

export const getProgram = (content: string) =>
    getRunsFromIniFile(content)
        .map(v => v.content)[0]
        .replace(/\r?\n/, '')
        .split(',')
        .map(v => parseInt(v, 10));

// each jump moves you by 4 distances
export const run = () => {
    const comp = new IntcodeComputer(getProgram(input));
    const cmds = [ // if
        'NOT A J', // hole 1dist away
        'NOT B T',
        'AND C T',
        'OR T J', // OR (hole 2dist AND ground 3dist)
        'NOT C T',
        'AND D T',
        'OR T J', // OR (hole 3dist AND ground 4dist)
        'WALK'
    ];
    comp.setInput(...[...cmds.join('\n')].map(s => s.charCodeAt(0)).concat([10]));
    let output = '';
    let last = 0;
    while (comp.hasMore()) {
        last = comp.run();
        output += String.fromCharCode(last);
    }
    console.log(output);
    console.log(last);
};
