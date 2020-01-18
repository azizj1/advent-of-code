import input from './25.txt';
import { IntcodeComputer } from '~/2019/9';
import { getProgram } from '~/2019/21';
import * as readline from 'readline-sync';
import chalk from 'chalk';
import { timer } from '~/util/Timer';

const getComp = () => new IntcodeComputer(getProgram(input));
const question = 'Command?';

export const run = () => {
    const comp = getComp();
    console.log(timer.start('prob 25'));
    let output = '';
    while (comp.hasMore()) {
        output += String.fromCharCode(comp.run());
        if (output.slice(-question.length) === question) {
            console.log(output);
            output = '';
            const input = readline.question(chalk.red('Your answer: '));
            comp.setInput(...[...input].map(s => s.charCodeAt(0)).concat([10]));
        }
    }
    console.log(output);
    console.log(timer.stop());
};
