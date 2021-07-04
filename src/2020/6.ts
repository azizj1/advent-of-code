import { timer } from '~/util/Timer';
import { getRunsFromIniFile } from '~/util/util';
import input from './6.txt';

interface Simulation {
  name: string;
  groups: Set<string>[];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniFile(input).map((sim) => ({
    name: sim.name,
    groups: sim.content.split('\n\n').map((g) => new Set(g.replace(/\n/g, ''))),
  }));
}

/**
 * This approach goes through each person in a group, and storing the answers in
 * a Map<answer, count>. If the count === # of people, then we keep the answer
 * in the intersected set.
 */
function getSimulationsB(): Simulation[] {
  return getRunsFromIniFile(input).map((sim) => ({
    name: sim.name,
    groups: sim.content.split('\n\n').map((g) => {
      // E.g., people = ['abc', 'abd', 'ab', 'b'];
      const people = g.split('\n').filter((p) => p.trim() !== '');
      // get a count of all the individual answers we got.
      const answerCount = people.reduce((map, answers) => {
        for (const ans of answers) {
          const count = map.get(ans) ?? 0;
          map.set(ans, count + 1);
        }
        return map;
      }, new Map<string, number>());

      // If the count of 'a' is equal to the number of people,
      // then 'a' should be included in the intersection.
      const ansIntersection = new Set<string>();
      for (const [ans, count] of answerCount) {
        if (count === people.length) {
          ansIntersection.add(ans);
        }
      }
      return ansIntersection;
    }),
  }));
}

/**
 * This approach converts each person in a group to a Set, and then we reduce
 * the array of Sets into a single set. If the finalSet has the answer we're
 * currently working on, then we keep it in the finalSet. Otherwise, we take it
 * out.
 */
function getSimulationsBAgain(): Simulation[] {
  return getRunsFromIniFile(input).map((sim) => ({
    name: sim.name,
    groups: sim.content.split('\n\n').map((g) => {
      return g
        .split('\n')
        .filter((p) => p.trim() !== '')
        .map((p) => new Set(p))
        .reduce(
          (finalSet, currSet) =>
            new Set([...finalSet].filter((a) => currSet.has(a)))
        );
      // new learning: if you don't include a second parameter to reduce,
      // it uses the first value in the array as the initial value. :O
    }),
  }));
}

function questionsAnswered({ groups }: Simulation) {
  return groups.reduce((sum, curr) => sum + curr.size, 0);
}

export function run() {
  timer.run(questionsAnswered, 'day 6a', getSimulations()[1]);
  timer.run(questionsAnswered, 'day 6b', getSimulationsB()[1]);
  timer.run(questionsAnswered, 'day 6b again', getSimulationsBAgain()[1]);
}
