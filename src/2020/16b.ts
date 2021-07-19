import { PriorityQueue } from '~/util/PriorityQueue';
import { timer } from '~/util/Timer';
import { Simulation, getSimulations, Ticket, Range } from './16';

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

function getFieldsName({ validRanges, nearbyTickets, ticket }: Simulation) {
  const index = buildInvertedIndex(validRanges);
  // const validTickets = [ticket, ...removeInvalidTickets(nearbyTickets, index)];
  const queue = new PriorityQueue<[number, Set<string>]>((p) => -1 * p[1].size);
  queue.values = index
    .map<[number, Set<string>]>((s, idx) => [idx, s])
    .filter(([, set]) => set != null);
  while (!queue.isEmpty()) {
    const [idx, possibleTypes] = queue.dequeue()!;
    console.log(
      'at index',
      idx,
      'possible types',
      possibleTypes.size,
      possibleTypes.size <= 10 ? possibleTypes : undefined
    );
  }
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(getFieldsName, `day 16b - ${sim.name}`, sim);
}
