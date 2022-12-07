import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './4.txt';

interface SectionInterval {
  start: number;
  end: number;
}

interface Simulation {
  name: string;
  pairs: [SectionInterval, SectionInterval][];
}

/*
 * @param str is for the form number-number
 */
function toSectionInterval(str: string): SectionInterval {
  const [start, end] = assert(
    str.split('-').map(Number),
    (n) => n.length === 2
  );
  return { start, end };
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    pairs: sim.content
      .map(
        (pair) =>
          assert(pair.split(','), (n) => n.length === 2) as [string, string]
      )
      .map(([a, b]) => [toSectionInterval(a), toSectionInterval(b)]),
  }));
}

function countFullyContainedRangesInPair(sim: Simulation) {
  let count = 0;
  for (const pair of sim.pairs) {
    // This will make sure the section that starts sooner
    // is "a". Then, we just need to check if "a"'s end time
    // is also later than "b"s.
    // Example: 3-9,2-8.
    // 1. Sort, so 2-8,3-9.
    // 2. Is 8 >= 9? No, so it's not fully contained.
    const [a, b] = pair.sort((a, b) => a.start - b.start);
    // If the start time are the same for both, then they
    // HAVE to be overlapping. E.g., [41-98], [41-97]
    if (a.start === b.start) count++;
    else if (a.end >= b.end) count++;
  }
  return count;
}

function countOverlappingRangesInPair(sim: Simulation) {
  let count = 0;
  for (const pair of sim.pairs) {
    const [a, b] = pair.sort((a, b) => a.start - b.start);
    if (a.end >= b.start) count++;
  }
  return count;
}

export function run() {
  declareProblem('2022 4');
  const sims = getSimulations();
  for (const sim of sims) {
    timer.run(countFullyContainedRangesInPair, sim.name, sim);
  }

  declareProblem('2022 4b');
  for (const sim of sims) {
    timer.run(countOverlappingRangesInPair, sim.name, sim);
  }
}
