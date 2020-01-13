import { IntcodeComputer } from '~/2019/9';
import { getProgram } from '~/2019/21';

// each jump is 4 distances long
export const run = () => {
    const comp = new IntcodeComputer(getProgram());
    // if (isGround(4) && (isHole(1) || isHole(2) || isHole(3)) && (isGround(5) || isGround(8)))
    const cmds = [ // if
        'NOT A J',
        'NOT B T',
        'OR T J',
        'NOT C T',
        'OR T J',
        'AND D J',
        'AND E T',
        'OR H T',
        'AND T J',
        'RUN'
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
