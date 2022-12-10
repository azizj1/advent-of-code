import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './7.txt';
import path from 'path';
import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';

interface File {
  name: string;
  size: number;
}

interface FileSystem {
  path: string;
  files: File[];
  directories: FileSystem[];
}

interface Simulation {
  name: string;
  root: FileSystem;
  // filepath to flesystem
  map: Map<string, FileSystem>;
}

type ContentIterator = ReturnType<typeof contentIterator>;

function contentIterator(content: string[]) {
  let idx = 0;
  return {
    next(): string | undefined {
      // return first, and then increment.
      return content[idx++];
    },
    hasNext() {
      return idx < content.length;
    },
    peek(): string | undefined {
      return content[idx];
    },
    return() {
      idx = 0;
    },
  };
}

function isCommand(line: string) {
  return line.slice(0, 2) === '$ ';
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    const root: FileSystem = {
      path: '/',
      files: [],
      directories: [],
    };
    const map = new Map([['/', root]]);
    let filepath = '/';
    const iterator = contentIterator(sim.content);
    while (iterator.hasNext()) {
      if (isCommand(iterator.peek()!)) {
        const [, command, args] = iterator.next()!.split(' ');
        switch (command) {
          case 'cd':
            filepath = path.join(
              filepath,
              assert(args, (a) => a.length > 0)
            );
            break;
          case 'ls':
            addList(iterator, filepath, map);
            break;
          default:
            throw new Error(`Unknown command ${command}`);
        }
      }
    }
    return {
      name: sim.name,
      root,
      map,
    };
  });
}

/**
 * @param cwd Current working directory.
 */
function addList(
  iterator: ContentIterator,
  cwd: string,
  addTo: Map<string, FileSystem>
) {
  if (!addTo.has(cwd)) {
    addTo.set(cwd, { path: cwd, files: [], directories: [] });
  }
  const system = addTo.get(cwd)!;
  while (iterator.hasNext() && !isCommand(iterator.peek()!)) {
    const line = iterator.next()!;
    let match: RegExpMatchArray | null = [''];
    if ((match = line.match(/^dir (\w+)$/))) {
      const [, dirname] = match!;
      const directory = {
        path: path.join(cwd, dirname),
        files: [],
        directories: [],
      };
      system.directories.push(directory);
      addTo.set(path.join(cwd, dirname), directory);
    } else if ((match = line.match(/^(\d+) ([^\s]+)$/))) {
      const [, size, filename] = match!;
      system.files.push({
        size: assert(Number(size), (s) => s >= 0),
        name: filename,
      });
    }
  }
}

function getDirectorySizes(sim: Simulation, max: number) {
  let totalCount = 0;
  // directory to its size
  const map = new Map<string, number>();

  const helper = (root: FileSystem): number => {
    if (map.has(root.path)) {
      return map.get(root.path)!;
    }

    let rootSize = root.files.reduce((sum, f) => sum + f.size, 0);
    if (root.directories.length === 0) {
      return rootSize;
    }
    for (const dir of root.directories) {
      const dirSize = helper(dir);
      rootSize += dirSize;
      map.set(dir.path, dirSize);
      if (dirSize <= max) {
        totalCount += dirSize;
      }
    }
    return rootSize;
  };
  const rootSize = helper(sim.root);
  map.set(sim.root.path, rootSize);
  return { sizes: map, sim, totalSizeOfDirectoriesBelowMax: totalCount };
}

function getDirectoryToDeleteForSpace(
  sim: Simulation,
  sizes: Map<string, number>,
  totalSpace: number,
  minSpaceNeeded: number
) {
  const sizeUsed = assert(sizes.get(sim.root.path));
  const spaceToRemove = assert(
    minSpaceNeeded - (totalSpace - sizeUsed),
    (n) => n > 0
  );
  let candidate = {
    path: '/',
    extraSpaceFreedUp: Infinity,
  };
  for (const [path, size] of sizes.entries()) {
    const extraSpaceFreedUp = size - spaceToRemove;
    if (extraSpaceFreedUp < 0) continue;
    if (candidate.extraSpaceFreedUp > extraSpaceFreedUp) {
      candidate = {
        path,
        extraSpaceFreedUp,
      };
    }
  }
  return { ...candidate, size: sizes.get(candidate.path)! };
}

export function run() {
  const sims = getSimulations();
  declareProblem('2022 day 7a');
  for (const sim of sims) {
    timer.run(
      (sim) => getDirectorySizes(sim, 100000).totalSizeOfDirectoriesBelowMax,
      sim.name,
      sim
    );
  }
  declareProblem('2022 day 7b');
  for (const sim of sims) {
    timer.run(
      getDirectoryToDeleteForSpace,
      sim.name,
      sim,
      getDirectorySizes(sim, 0).sizes,
      70000000,
      30000000
    );
  }
}
