import chalk from 'chalk';

export const last = <T>(arr: T[]) => arr[arr.length - 1];
export const first = <T>(arr: T[]) => arr[0];

// because we're using RegExp, one \ is not enough (which you would do
// if you were using /expression/gs), because \ is for escaping in string.
// We want a literal \ so it's taken as a escape in RegExp, thus we do \\.
// Reason we use RegExp instead of /expression/gs because we want to multiline
// our regex to add comments.
const INI_FILE_REGEX = new RegExp(
  '\\[([^\\]]+)\\]\\r?\\n?' + // the header of file. E.g., [input]
    '((?:(?:[A-Za-z]+=[\\w /]+)\\r?\\n?)*)' + // any properties separated by newline. x=4\ny=3
    '(.+?' + // the rest of the content.
    // positive lookahead. The match must either end in EOF ($), or 0+ newlines
    // followed by [, indicating start of another ini match.
    '(?=((\\r?\\n?)*\\[|$)))',
  'gs' // flags. 'g' don't stop after first match, and 's' dot matches newline.
);
export const getRunsFromIniFile = (content: string) =>
  Array.from(content.matchAll(INI_FILE_REGEX)).map((run) => ({
    name: run[1],
    properties: run[2]
      .split('\n')
      .filter((p) => p.trim().length > 0)
      .reduce((map, p) => {
        const [key, val] = p.split('=');
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(val);
        return map;
      }, new Map<string, string[]>()),
    content: run[3],
  }));

export const getRunsFromIniCommaSep = (content: string, delim = ',') =>
  getRunsFromIniFile(content).map(({ name, content, properties }) => ({
    name,
    properties,
    content: content
      .replace(/\r?\n/, '')
      .split(delim)
      .filter((s) => s.trim() !== ''),
  }));

export const getRunsFromIniNewlineSep = (content: string) =>
  getRunsFromIniFile(content).map(({ name, content, properties }) => ({
    name,
    properties,
    content: content.split(/\r?\n/).filter((s) => s.trim() !== ''),
  }));

let savedConsoleInfo: ((message?: string) => void) | null = null;
export const dropConsoleInfo = () => {
  savedConsoleInfo = console.info;
  console.info = () => void 0;
};

export const resetConsoleInfo = () => {
  if (savedConsoleInfo != null) {
    console.info = savedConsoleInfo;
  }
};

export const declareProblem = (title: string) =>
  console.log(chalk.redBright(`====PROBLEM ${title}====`));
export const declareSubproblem = (title: string) =>
  console.log(chalk.red(`==sub ${title}==`));

/* eslint-disable */
type PipeFn<T extends any[], V> = readonly [
  (...args: T) => any,
  ...any[],
  (...args: any) => V
];
/* eslint-enable */

export function pipe<T extends unknown[], V>(
  ...args: PipeFn<T, V>
): (...args: T) => V {
  return (...inputs: T) => {
    const firstValue = args[0](...inputs);
    return args.slice(1).reduce((val, func) => func(val), firstValue);
  };
}
