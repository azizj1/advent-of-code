# Morning Brew Puzzle - Dec 24th, 2021 - Scope-heads

Your task is to make `100` by placing pluses and minuses in the string of digits
`9 8 7 6 5 4 3 2 1` in that order. But that’s not actually your only task. To
get full credit on this puzzle, you must find the least number of pluses and
minuses needed to get to `100`.

# Solution

`98 - 76 + 54 + 3 + 21`, so just four symbols.

1. Start with an array of size 8, where each element in the array is `''`
   (empty). This array represents what symbol is between each number. There are
   `9` total numbers, which implies there are `8` gaps; hence, the size of this
   array.
   - `''` (empty) string represents no symbol.
   - `-` (minus) represents subtraction.
   - `+` (plus) represents addition.
2. From this initial array, starting at index `i = 0`, make 3 recursive calls:
   - Don't change symbol at index `i`, and move onto the next index `i + 1`.
   - Change symbol at index `i` to `-`. Move onto index `i + 1`.
   - Change symbol at index `i` to `+`. Move onto index `i + 1`.
3. The base case for our recursions are:
   - We're at the end of the array (our array representing the `8` gaps). In
     this case, we just return whatever sum we get, may or may not be `100`.
     Return the total number of plus/minuses as well.
   - We're at a sum of `100`. Return the sum, as well as the # of plus/minuses.

Here's are some examples of the gap array:

```typescript
const testCases = [
  {
    locations: Array.from({ length: 8 }, () => ''),
    expected: 987654321,
  },
  {
    locations: ['', '', '', '', '', '', '', '-'],
    expected: 98765432 - 1,
  },
  {
    locations: ['+', '', '', '', '', '', '', '-'],
    expected: 9 + 8765432 - 1,
  },
  {
    locations: ['+', '-', '', '', '', '', '', '-'],
    expected: 9 + 8 - 765432 - 1,
  },
  {
    locations: ['+', '-', '-', '', '', '+', '', '-'],
    expected: 9 + 8 - 7 - 654 + 32 - 1,
  },
] as { locations: PlusMinusEmpty[]; expected: number }[];
```

We then test our function `getSum` that takes the gap array and calculates the
sum:

```typescript
export function test() {
  for (const tcase of testCases) {
    const actual = getSum(tcase.locations);
    assert(
      tcase.expected === actual,
      `expected=${tcase.expected}; actual=${actual}`
    );
  }
  console.log('done testing!');
}
```

As for our recursive solution:

```typescript
export function run() {
  declareProblem('morning brew');
  // Change this number to try a different sum.
  const GOAL = 100;

  type HelperResponse = {
    locations: PlusMinusEmpty[];
    minusPlusCount: number;
    sum: number;
  };
  const toResponse = (locations: PlusMinusEmpty[], sum: number) => {
    return {
      sum,
      locations,
      minusPlusCount: locations.reduce(
        (tot, curr) => (curr === '+' || curr === '-' ? tot + 1 : tot),
        0
      ),
    };
  };

  let execution = 0;
  const helper = (locations: PlusMinusEmpty[], idx: number): HelperResponse => {
    const sum = getSum(locations);
    if (idx === locations.length) {
      return toResponse(locations, sum);
    } else if (sum === GOAL) {
      return toResponse(locations, sum);
    }
    execution++;
    const tries = [
      helper(locations, idx + 1), // No change to symbol. I.e., keep it empty ''.
      helper(replaceAt(locations, idx, '-'), idx + 1), // minus
      helper(replaceAt(locations, idx, '+'), idx + 1), // plus
    ].filter((t) => t.sum === GOAL);

    if (tries.length === 0) {
      // no solution; don't care about the sum, so just setting it to Infinity.
      // These will get filtered out anyways higher up the recursion tree.
      return toResponse(locations, Infinity);
    } else {
      // at least one solution. Take the one with the fewest number of
      // plus/minus
      let minTry = tries[0];
      for (let i = 1; i < tries.length; i++) {
        if (tries[i].minusPlusCount < minTry.minusPlusCount) {
          minTry = tries[i];
        }
      }
      return minTry;
    }
  };

  const ans = helper(
    Array.from({ length: 8 }, () => ''),
    0
  );
  console.log('done!', ans, toEquation(ans.locations), execution);
  return ans;
}
```
