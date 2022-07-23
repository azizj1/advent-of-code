import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
import input from './frisbee-roster.txt';

function getDraftOrders() {
  return getRunsFromIniNewlineSep(input).map((c) => new DraftOrder(c.content));
}

class DraftOrder {
  /**
   * @param players The players in the order they were picked.
   */
  constructor(private readonly players: string[]) {}

  get key() {
    return [...this.players].sort((a, b) => a.localeCompare(b)).join(',');
  }

  /**
   * Pick the next best player.
   */
  pick() {
    return this.players.shift();
  }

  hasPlayers() {
    return this.players.length > 0;
  }
}

class DraftOrderAggregator {
  constructor(private readonly draftOrders: DraftOrder[]) {}

  getDraftAnswer(): Map<string, Map<string, number>> {
    // poolOfPlayers -> selectedPlayer -> # of times selected.
    const result = new Map<string, Map<string, number>>();
    for (const draftOrder of this.draftOrders) {
      while (draftOrder.hasPlayers()) {
        const pool = draftOrder.key;
        if (!result.has(pool)) {
          result.set(pool, new Map());
        }

        const selectedPlayers = result.get(pool)!;
        const selectedPlayer = draftOrder.pick()!;
        if (!selectedPlayers.has(selectedPlayer)) {
          selectedPlayers.set(selectedPlayer, 0);
        }
        const frequency = selectedPlayers.get(selectedPlayer)!;
        selectedPlayers.set(selectedPlayer, frequency + 1);
      }
    }
    return result;
  }
}

export function run() {
  declareProblem('Frisbee roster!');
  const draftOrders = getDraftOrders();
  const aggregator = new DraftOrderAggregator(draftOrders);
  const answer = aggregator.getDraftAnswer();
  const keys = Array.from(answer.keys()).sort(
    (a, b) => a.split(',').length - b.split(',').length
  );
  let total = 0;
  for (const key of keys) {
    console.log(key, answer.get(key));
    total += Array.from(answer.get(key)!.values()).reduce(
      (sum, curr) => sum + curr
    );
  }
  console.log('total', total);
}
