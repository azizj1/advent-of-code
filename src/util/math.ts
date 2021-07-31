export function mod(a: number, m: number) {
  const ans = a % m;
  if (ans < 0) {
    return ans + m;
  }
  return ans;
}
