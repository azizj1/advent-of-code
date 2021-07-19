import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep } from '~/util/util';
import input from './16.txt';

export interface Range {
  name: string;
  start: number;
  end: number;
}

export type Ticket = number[];

export interface Simulation {
  name: string;
  validRanges: Range[];
  ticket: Ticket;
  nearbyTickets: Ticket[];
}

export function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    const ranges: Range[] = [];
    const nearbyTickets: Ticket[] = [];
    let ticket: Ticket | null = null;
    let examiningNearbyTickets = false;

    for (let i = 0; i < sim.content.length; i++) {
      const line = sim.content[i];
      if (/\d+-\d+/.test(line)) {
        const name = assert(line.match('^.+(?=:)'), (m) => m!.length > 0)[0];
        line
          .match(/\d+-\d+/g)
          ?.map<[number, number]>((range) =>
            assert(
              range.split('-').map(Number) as [number, number],
              (r) => r.length === 2
            )
          )
          ?.forEach((range) =>
            ranges.push({ name, start: range[0], end: range[1] })
          );
      }
      if (line === 'nearby tickets:') {
        examiningNearbyTickets = true;
      } else if (/^(\d+,)+\d+$/.test(line)) {
        const fields = line.split(',').map(Number);
        if (examiningNearbyTickets) {
          nearbyTickets.push(fields);
        } else {
          ticket = fields;
        }
      }
    }

    return {
      name: sim.name,
      validRanges: ranges,
      ticket: assert(ticket),
      nearbyTickets: nearbyTickets,
    };
  });
}

function isValid({ validRanges, nearbyTickets }: Simulation) {
  const invalidNumbers: number[] = [];
  const hash: boolean[] = [];
  for (const { start, end } of validRanges) {
    for (let i = start; i <= end; i++) {
      hash[i] = true;
    }
  }
  for (const ticket of nearbyTickets) {
    for (const field of ticket) {
      if (!hash[field]) {
        invalidNumbers.push(field);
      }
    }
  }
  return invalidNumbers.reduce((sum, curr) => curr + sum);
}

export function run() {
  const sim = getSimulations()[1];
  timer.run(isValid, `day 16 - ${sim.name}`, sim);
}
