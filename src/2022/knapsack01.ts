/* This is from discrete optimization class, week 2 knapsack. */

import { timer } from '~/util/Timer';

interface Item {
  weight: number;
  value: number;
}

export const input2 = [
  {
    weight: 1,
    value: 2,
  },
  {
    weight: 2,
    value: 1,
  },
  {
    weight: 5,
    value: 7,
  },
];

/**
 * @param items Items available with weight that goes against the capacity but
 * have a value to them. Items can only be added once.
 * @param capacity How much weight we can store in our knapsack.
 * @return The maximum value we can get given the items and capacity.
 */
function knapsack01(items: Item[], capacity: number) {
  const dp: number[][] = Array.from({ length: items.length }, () => []);

  for (let i = 0; i < items.length; i++) {
    // TODO(azizj): I should probably be starting at j=0, and if item.weight >
    // j, dp[i][j] should equal dp[i - 1][j].
    for (let j = items[i].weight; j <= capacity; j++) {
      // Don't add current item's value or weight. Use last item's dp instead.
      const dontAddItem = dp[i - 1]?.[j] ?? 0;
      // Consider adding the current item, by seeing what the value was last dp
      // at (j - weightOfCurrentItem).
      const addItem = (dp[i - 1]?.[j - items[i].weight] ?? 0) + items[i].value;
      dp[i][j] = Math.max(dontAddItem, addItem);
    }
  }
  return dp[items.length - 1][capacity];
}

export function run() {
  timer.run(knapsack01, 'knapsack 0/1', input2, 10);
}
