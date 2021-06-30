import chalk from 'chalk';

export const last = <T>(arr: T[]) => arr[arr.length - 1];
export const first = <T>(arr: T[]) => arr[0];

export const getRunsFromIniFile = (content: string) =>
    Array.from(content.matchAll(/\[([^\]]+)\]\r?\n?(.+?(?=(\[|$)))/gs)).map((run) => ({
        name: run[1],
        content: run[2],
    }));

export const getRunsFromIniCommaSep = (content: string, delim = ',') =>
    getRunsFromIniFile(content).map(({ name, content }) => ({
        name,
        content: content
            .replace(/\r?\n/, '')
            .split(delim)
            .filter((s) => s.trim() !== ''),
    }));

export const getRunsFromIniNewlineSep = (content: string) =>
    getRunsFromIniFile(content).map(({ name, content }) => ({
        name,
        content: content.split(/\r?\n/).filter((s) => s.trim() !== ''),
    }));

let savedConsoleInfo: ((message?: string) => void) | null = null;
export const dropConsoleInfo = () => {
    savedConsoleInfo = console.info;
    console.info = () => void 0;
};

export const resetConsoleInfo = () => {
    if (savedConsoleInfo != null) console.info = savedConsoleInfo;
};

export const declareProblem = (title: string) =>
    console.log(chalk.redBright(`====PROBLEM ${title}====`));
export const declareSubproblem = (title: string) => console.log(chalk.red(`==sub ${title}==`));

// eslint-disable-next-line
type PipeFn<T extends any[], V> = readonly [(...args: T) => any, ...any[], (...args: any) => V];

export function pipe<T extends unknown[], V>(...args: PipeFn<T, V>): (...args: T) => V {
    return (...inputs: T) => {
        const firstValue = args[0](...inputs);
        return args.slice(1).reduce((val, func) => func(val), firstValue);
    };
}
