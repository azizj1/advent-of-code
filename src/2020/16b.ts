import { assert } from '~/util/assert';
import { PriorityQueue } from '~/util/PriorityQueue';
import { difference, intersect } from '~/util/sets';
import { timer } from '~/util/Timer';
import { pipe } from '~/util/util';
import { Simulation, getSimulations, Ticket, Range } from './16';

/**
 * A rule like `row: 5-7 or 9-11` would have at least 'row' in index 5, 6, 7, 9,
 * 10, and 11.
 */
function buildInvertedIndex(validRanges: Range[]) {
  // maps a number to the set of possible field names
  const index: Set<string>[] = [];
  for (const { name, start, end } of validRanges) {
    for (let i = start; i <= end; i++) {
      if (!index[i]) {
        index[i] = new Set();
      }
      index[i].add(name);
    }
  }
  return index;
}

function removeInvalidTickets(
  nearbyTickets: Ticket[],
  invertedIndex: Set<string>[]
) {
  return nearbyTickets.filter((ticket) =>
    ticket.every((field) => invertedIndex[field] != null)
  );
}

function classifyVectorColumns(
  nearbyTickets: Ticket[],
  ticket: Ticket,
  invertedIndex: Set<string>[]
) {
  const validTickets = [
    ticket,
    ...removeInvalidTickets(nearbyTickets, invertedIndex),
  ];
  const size = ticket.length;
  const classifiedVectorColumns: Set<string>[] = [];
  for (let i = 0; i < size; i++) {
    classifiedVectorColumns[i] = intersect(
      ...validTickets.map((tk) => tk[i]).map((field) => invertedIndex[field])
    );
  }
  return classifiedVectorColumns;
}

function getFieldsName({ validRanges, nearbyTickets, ticket }: Simulation) {
  // for every single numerical value, what are the possible field names?
  const index = buildInvertedIndex(validRanges);
  const classifiedVectorColumns = classifyVectorColumns(
    nearbyTickets,
    ticket,
    index
  );
  // column indexes with the least ambiguity (i.e., fewest number of possible
  // field names) are dequeued first.
  const queue = new PriorityQueue<[number, Set<string>]>((p) => -1 * p[1].size);
  queue.values = classifiedVectorColumns.map<[number, Set<string>]>(
    (s, idx) => [idx, s]
  );

  const resolvedNames = new Set<string>();
  const nameToColumnIdx = new Map<string, number>();
  while (!queue.isEmpty()) {
    const [idx, possibleTypes] = queue.dequeue()!;
    // there must always be one remaining for greedy alg to work.
    const remainingNames = assert(
      difference(possibleTypes, resolvedNames),
      (s) => s.size === 1
    );
    const remaining = [...remainingNames][0];
    resolvedNames.add(remaining);
    nameToColumnIdx.set(remaining, idx);
  }
  return { nameToColumnIdx, ticket };
}

function multiply({
  nameToColumnIdx,
  ticket,
}: {
  nameToColumnIdx: Map<string, number>;
  ticket: Ticket;
}) {
  let result = 1;
  for (const [name, columnIdx] of nameToColumnIdx) {
    if (name.indexOf('departure ') === 0) {
      result *= ticket[columnIdx];
    }
  }
  return result;
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(pipe(getFieldsName, multiply), `day 16b - ${sim.name}`, sim);
}
