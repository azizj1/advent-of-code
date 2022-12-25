import { assert } from './assert';
import chalk from 'chalk';

export const last = <T>(arr: ArrayLike<T>) => arr[arr.length - 1];
export const first = <T>(arr: ArrayLike<T>) => arr[0];

// because we're using RegExp, one \ is not enough (which you would do
// if you were using /expression/gs), because \ is for escaping in string.
// We want a literal \ so it's taken as a escape in RegExp, thus we do \\.
// Reason we use RegExp instead of /expression/gs because we want to multiline
// our regex to add comments.
const INI_FILE_REGEX = new RegExp(
  '\\[([^\\]]+)\\]\\r?\\n' + // the header of file. E.g., [input]
    '((?:(?:[A-Za-z]+=[\\w /]+)\\r?\\n)*)' + // any properties separated by newline. x=4\ny=3
    '(.+?' + // the rest of the content.
    // positive lookahead. The match must either end in EOF ($), or 0+ newlines
    // followed by [, indicating start of another ini match.
    '(?=((\\r?\\n)+\\[|$)))',
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

export const getRunsFromIniEmptyLineSep = (content: string) =>
  getRunsFromIniFile(content).map(({ name, content, properties }) => ({
    name,
    properties,
    content: content
      .split(/(?:\r?\n){2,}/)
      .filter((s) => s.trim() !== '')
      .map((c) => c.split(/\r?\n/).filter((s) => s.trim() !== '')),
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

/**
 * An input of ([-1, 0], 3) would return 2^3 = 8 results of length 3. Some
 * permutations include: [-1, -1, -1], [-1, -1, 0], [-1, 0, -1], etc.
 * @param fromSet the numbers you want to permute.
 * @param length How long each result should be.
 * @return An array of permutations of length given by fromSet.length ^ length,
 * where each permutation is of length `lenth`.
 */
export function getPermutations(fromSet: number[], length: number): number[][] {
  const result: number[][] = [];
  // bactracking algorithm.
  const helper = (workingSet: number[]) => {
    if (workingSet.length === length) {
      result.push([...workingSet]);
      return;
    }
    for (const item of fromSet) {
      workingSet.push(item);
      helper(workingSet);
      workingSet.pop();
    }
  };
  helper([]);
  return result;
}

/**
 * Gets all possible integer vectors from startVector to endVector.
 * E.g., [-2, 1] to [0, 2] would return things like [-2,1], [-2,2], [-1,1],
 * [-1,2], [0,1], [0, 2].
 * Note that your vector can be more than 2D. [-10, -5, 0, -10, 2] to [0, 0, 0,
 * 0, 0] is valid.
 */
export function getSpace(startVector: number[], endVector: number[]) {
  assert(startVector.length === endVector.length);
  assert(endVector.every((e, idx) => e >= startVector[idx]));

  const result: number[][] = [];
  const helper = (workingVector: number[]) => {
    if (workingVector.length === startVector.length) {
      result.push([...workingVector]);
      return;
    }
    const nextIdx = workingVector.length;
    const start = startVector[nextIdx];
    const end = endVector[nextIdx];
    for (let i = start; i <= end; i++) {
      workingVector.push(i);
      helper(workingVector);
      workingVector.pop();
    }
  };
  helper([]);
  return result;
}

export function isNonNull<T>(o: T): o is NonNullable<T> {
  return o !== undefined && o !== null;
}
