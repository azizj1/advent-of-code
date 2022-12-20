export function mod(a: number, m: number) {
  const ans = a % m;
  if (ans < 0) {
    return ans + m;
  }
  return ans;
}

/*
Input: [
    [a, b],
    [c, d]
    [e]
]
Output: [
    [a, c, e],
    [a, d, e],
    [b, c, e],
    [b, d, e]
]
*/
export function combinations<T>(lists: T[][]) {
  const solutions: T[][] = [];

  const helper = (atKeyIndex: number, curr: T[]) => {
    if (curr.length === lists.length) {
      solutions.push([...curr]);
      return;
    }
    for (let i = atKeyIndex; i < lists.length; i++)
      for (let j = 0; j < lists[i].length; j++) {
        curr.push(lists[i][j]);
        helper(i + 1, curr);
        curr.pop();
      }
  };
  helper(0, []);
  return solutions;
}
