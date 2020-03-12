import * as chalk from 'chalk';

export default class Timer {
    private startTime: [number, number]; // [seconds, nanoseconds] so if execution took 4s1ms, it'd be [4, 1000000]
    private title: string | null;
    private withColor: boolean;

    constructor(withColor = true) {
        this.startTime = [0, 0];
        this.title = null;
        this.withColor = withColor;
    }

    start(title?: string) {
        if (title != null)
            this.title = title;
        let returnString = '';
        if (this.withColor) {
            returnString = chalk.default.green('Timer started');
            if (title != null)
                returnString = chalk.default.green('Timer for ') +
                    chalk.default.blue(title || '') +
                    chalk.default.green(' started');
        }
        else {
            returnString = this.title == null ? 'Timer started' : `Timer for ${this.title} started`;
        }
        this.startTime = process.hrtime();
        return returnString;
    }

    stop() {
        const hrend = process.hrtime(this.startTime);
        const time = `${hrend[0]}s ${hrend[1] / 1000000}ms`;
        this.reset();

        if (this.withColor) {
            if (this.title == null)
                return chalk.default.yellow('Execution time: ') +
                    chalk.default.yellow.bold(time) + '\n';
            return chalk.default.yellow('Execution time for ') +
                chalk.default.blue(this.title) +
                chalk.default.yellow(': ') +
                chalk.default.yellow.bold(time) + '\n';
        }
        return `Execution time${this.title == null ? '' : ' for ' + this.title}: ${time}\n`;
    }

    reset() {
        this.startTime = [0, 0];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    run<E extends { toString(): string }>(body: (...inputs: any[]) => any, title?: E, ...inputs: any[]) {
        console.log(this.start(title?.toString()));
        const output = body(...inputs);
        if (output != null)
            console.log(output);
        console.log(this.stop());
    }
}

export const timer = new Timer();
