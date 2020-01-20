import { timer } from '~/util/Timer';
import { getgcd } from '~/2019/10';
import input from './22.txt';
import { first, getRunsFromIniFile } from '~/util/util';
import chalk from 'chalk';

export const isPrime = (n: number) => {
    if (n === 2 || n === 3)
        return true;
    if (n % 2 === 0 || n % 3 === 0)
        return false;
    const max = Math.floor(Math.sqrt(n));
    let p = 5;
    while (p <= max) {
        if (n % p === 0 || n % (p + 2) === 0) // all primes are 6k +/- 1
            return false;
        p += 6; // all primes are 6k +/- 1
    }
    return true;
};

// modular exponentiation
// x^9 =
//    a = x^4
//        b = x^2
//            c = x -> return x
//        -> return c * c (equiv to x * x)
//    -> return b * b (equiv to x^2 * x^2)
// -> return a * a * x (equiv to x^4 * x^4 * x = x^9)

// Another way to look at it:
//      x^9 = x^4 * x^4 * x
//      x^4 is calculated the same way: x^2 * x^2
export const modExp = (base: bigint, power: bigint, mod: bigint): bigint => {
    if (power === 0n)
        return 1n;
    if (power === 1n)
        return base % mod;
    let result = modExp(base, power >> 1n, mod); // power = Math.floor(power / 2)
    result = (result * result) % mod;

    // if power is odd, multiply it with base. E.g., 5^3 = 5^2 x 5^1.
    // 5^2 is taken care of from the recursion
    if ((power & 1n) === 1n)
        result = (result * base) % mod;

    return result;
};

// primeMod must be prime to use Fermats's Little Theorem
// https://www.geeksforgeeks.org/multiplicative-inverse-under-modulo-m/
// O(log primeMod)
export const modInverseFLT = (base: number, primeMod: number) => {
    if (getgcd(base, primeMod) !== 1)
        throw `There is no mod inverse for ${base} % ${primeMod} because ${base} and ${primeMod}` +
            ' are not co-prime (relatively prime)';

    return modExp(BigInt(base), BigInt(primeMod - 2), BigInt(primeMod));
};

/*
Input: a = 30, b = 20
Output: gcd = 10
        x = 1, y = -1
(Note that 30*1 + 20*(-1) = 10)

Input: a = 35, b = 15
Output: gcd = 5
        x = 1, y = -2
(Note that 35*1 + 15*(-2) = 5)

https://www.geeksforgeeks.org/euclidean-algorithms-basic-and-extended/

As seen above, x and y are results for inputs a and b,
   a.x + b.y = gcd                      ----(1)

And x1 and y1 are results for inputs b%a and a
   (b%a).x1 + a.y1 = gcd

When we put b%a = (b - (⌊b/a⌋).a) in above,
we get following. Note that ⌊b/a⌋ is floor(a/b)

   (b - (⌊b/a⌋).a).x1 + a.y1  = gcd

Above equation can also be written as below
   b.x1 + a.(y1 - (⌊b/a⌋).x1) = gcd      ---(2)

After comparing coefficients of 'a' and 'b' in (1) and
(2), we get following
   x = y1 - ⌊b/a⌋ * x1
   y = x1

*/
export const gcdExtended = (a: bigint, b: bigint) => {
    let x = 0n, y = 0n;

    const helper = (a: bigint, b: bigint): bigint => {
        if (a === 0n) {
            x = 0n;
            y = 1n;
            return b;
        }
        const gcd = helper(b % a, a);
        const temp = x;
        x = y - b / a * x; // for big ints, division truncates
        y = temp;

        return gcd;
    };
    const result = helper(a, b);
    return {x, y, result};
};

export const modInverse = (base: bigint, mod: bigint) => {
    if (getgcd(Math.abs(Number(base)), Math.abs(Number(mod))) !== 1 && base !== 0n)
        throw `There is no SINGLE mod inverse for ${base} % ${mod} because ${base} and ${mod}` +
            ' are not co-prime (relatively prime)';
    const { x } = gcdExtended(base, mod);
    return (x % mod + mod) % mod;
};

// solves linear congruence
// returns x which satisfies ax = b (mod m)
// returns x which satsifies ax % m = b
export const solveLinCongruence = (a: number | bigint, b: number | bigint, mod: number | bigint) => {
    const aN = BigInt(a);
    const bN = BigInt(b);
    const modN = BigInt(mod);
    const inverse = modInverse(aN, modN);
    return (bN * inverse) % modN;
};

// goes from y = mx + b -> y = -mx + y(-1) = -mx + (-m + b) = [b - m, -m]
export const newStack = (constant: bigint, slope: bigint, mod: bigint): [bigint, bigint] =>
    [(constant - slope) % mod, -1n * slope];

// slope doesn't change, but y = mx + b  ->  y = mx + y(n) = mx + mn + b = [mn + b, m]
export const cut = (n: number) => (constant: bigint, slope: bigint, mod: bigint): [bigint, bigint] =>
    [(constant + BigInt(n) * slope) % mod, slope];

// whatever the increment in, say inc = 3, you need to first figure out the form of y = mx + b. E.g.,
// if 0 1 2 3 4 5 6 7 8 9, and inc = 3, then the set becomes
//    0 7 4 1 8 5 2 9 6 3
// if you notice, slope = 7. That's because we know that if a number it at index i, it'll get moved to
// i * inc % size = newPosition  -->  3i % 10 = newPosition
// So for i = 0 -> new = 0, i = 1 -> new = 3, i = 2 -> new = 6, i = 3 -> 9, i = 4 -> 2, etc.
// We want to know the CHANGE, the slope, and to do that, we need to solve what the old index was to get newPosition = 1
// I.e., 3i % 10 = 1. What's i to get newPosition = 1?
// We can split this up modularly, 3i ≡ 1  (mod 10). We can just figure out the modular inverse to do this!
// solveLinCongruence() actually solves 3i = b  (mod 10), so we pass b = 1 to it.
// we get that slope = 7, as expected, and our equation now becomes -> y = 7x + b
// if we had a slope from before, say it was 7 (so an inc of 3) from before, i.e.,
//   0 7 4 1 8 5 2 9 6 3
//   ^ we increment that by 3 again to get
//   0 9 8 7 6 5 4 3 2 1
// the slope is now 9. We can get that by getting the modInverse of 3 again, which is 7 and then doing
// prevSlope * 7 % 10 = 49 % 10 = 9
export const increment = (n: number) => (constant: bigint, slope: bigint, mod: bigint): [bigint, bigint] =>
    [constant, (slope * solveLinCongruence(n, 1, mod)) % mod];

const toTechnique = (s: string) => {
    if (s.indexOf('stack') >= 0)
        return newStack;
    if (s.indexOf('increment') >= 0)
        return increment(Number(first(s.match(/-?\d+/g) ?? [])));
    if (s.indexOf('cut') >= 0)
        return cut(Number(first(s.match(/-?\d+/g) ?? [])));
    throw new Error('Technique not found');
};

export const getSimulations = () => getRunsFromIniFile(input).map(ini => {
    const header = ini.name.split(',');
    const size = Number(header[1]);
    const times = Number(header[2]);
    const indicesOfInterest = header[3] === 'ALL' ?
        Array.from({length: size}, (_, i) => i) :
        header.slice(3).map(Number);
    return {
        name: header[0],
        size,
        times,
        indicesOfInterest,
        techniques: ini.content.split('\n').filter(s => s.trim() !== '').map(toTechnique)
    };
});

export const applyTechniques =
    (techniques: ((constant: bigint, slope: bigint, mod: bigint) => [bigint, bigint])[], size: number | bigint) =>
    (initConstant = 0n, initSlope = 1n) =>
{
    let constant = initConstant;
    let slope = initSlope;
    const sizeN = BigInt(size);
    for (let i = 0; i < techniques.length; i++) {
        [constant, slope] = techniques[i](constant, slope, sizeN);
    }
    return { slope, constant };
};

/*
When we shuffle for the first time, we go from y0(x) = 1x + 0 to y1(x) = mx + b. Makes sense because
y0(0) = 0, y0(1) = 1, etc. The cards start off in order.
After we shuffle once, the card @ index = 0 is y1(0) = b, index = 1 is y1(1) = m + b, y1(2) = 2m + b, etc.
Now we're going to start at x = b (instead of x = 0 like we do for y0) to get y2, i.e., after shuffling twice
    y2(0) = m * y1(0) + b = mb + b            // card at index 0 after shuffling twice
    y2(1) = m * y1(1) + b = m * (m + b) + b = m^2 + (mb + b)
    y2(2) = m * y1(2) + b = m * (2m + b) + b = 2m^2 + (mb + b)
    ...
    y2(x) = xm^2 + (mb + b)

    What happens after we shuffle 3 times? Again, shuffle 3 will start off where shuffle 2 ended,
    so y2(0) is where y3 will start
    y3(0) = m * y2(0) + b = m * (mb + b) + b = m^2*b + mb + b
    y3(1) = m * y2(1) + b = m * (m^2 + mb + b) + b = m^3 + (m^2*b + mb + b)
    y3(2) = m * y2(2) + b = m * (2m^2 + mb + b) + b = 2m^3 + (m^2*b + mb + b)
    ...
    y3(x) = xm^3 + (m^2*b + mb + b)

    Can be generalized for yn(x) as follows:

    yn(x) = xm^n + \sum_{i=0}^{n-1}(b * m^i),
        slope = m^n
        constant = \sum_{i=0}^{n-1}(b * m^i)

    again, everything is mod'ed (%).

    The new constant is a geometric series, which has a closed-form equation:
    \sum_{i=0}^{n-1}(b * m^i)
        = b * (1 - m^n) / (1 - m)  (mod SIZE)

    Recall that ax ≡ b (mod m) can be solved using linear congruence. Our 'b' is the new constant above, and a = 1
*/
export const repeatShuffle =
    (size: number) =>
    (constant: bigint, slope: bigint, times: number) =>
    (indexOfInterest: number) =>
{
    const sizeN = BigInt(size);
    const indexOfInterestN = BigInt(indexOfInterest);
    const timesN = BigInt(times);

    const slopePowerN = modExp(slope, timesN, sizeN);
    const newConstant = solveLinCongruence(1n - slope, constant * (1n - slopePowerN), sizeN);
    console.log('slopePowerN', slopePowerN, 'newConstant', newConstant);
    const inRange = (newConstant + indexOfInterestN * slopePowerN) % sizeN;
    return Number((sizeN + inRange) % sizeN); // in case the number is still negative, add size to it and mod it.
};

export const run = () => {
    const sims = getSimulations().slice(-2);
    for (const s of sims) {
        console.log(timer.start(`22b - ${s.name} (size=${chalk.red(s.size + '')} techniques=${chalk.red(s.techniques.length + '')} repeat=${chalk.red(s.times + '')} indexOfInterest=${chalk.red(s.indicesOfInterest + '')})`));
        const { constant, slope } = applyTechniques(s.techniques, s.size)();
        console.log({ constant, slope });
        const finalIndex = s.indicesOfInterest.map(repeatShuffle(s.size)(constant, slope, s.times));
        console.log(finalIndex);
        console.log(timer.stop());
    }
};
