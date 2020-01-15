import { timer } from '~/util/Timer';
import { getgcd } from '~/2019/10';
import input from './22.txt';
import { first, getRunsFromIniFile } from '~/util/util';
import chalk from 'chalk';

const newDeckSize = 119315717514047; // is a prime number!

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
export const modExp = (base: number, power: number, mod: number): number => {
    if (power === 0)
        return 1;
    if (power === 1)
        return base % mod;
    let result = modExp(base, power >> 1, mod); // power = Math.floor(power / 2)
    result = (result * result) % mod;

    // if power is odd, multiply it with base. E.g., 5^3 = 5^2 x 5^1.
    // 5^2 is taken care of from the recursion
    if ((power & 1) === 1)
        result = (result * base) % mod;

    return result;
};

// primeMod must be prime to use Fermats's Little Theorem
// https://www.geeksforgeeks.org/multiplicative-inverse-under-modulo-m/
// O(log primeMod)
export const modInverseFLT = (base: number, primeMod: number) => {
    if (getgcd(base, primeMod) !== 1)
        // eslint-disable-next-line max-len
        throw new Error(`There is no mod inverse for ${base} % ${primeMod} because ${base} and ${primeMod} are not co-prime (relatively prime)`);

    return modExp(base, primeMod - 2, primeMod);
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
export const gcdExtended = (a: number, b: number) => {
    let x = 0, y = 0;

    const helper = (a: number, b: number): number => {
        if (a === 0) {
            x = 0;
            y = 1;
            return b;
        }
        const gcd = helper(b % a, a);
        const temp = x;
        x = y - Math.floor(b / a) * x;
        y = temp;

        return gcd;
    };
    const result = helper(a, b);
    return {x, y, result};
};

export const modInverse = (base: number, mod: number) => {
    if (getgcd(base, mod) !== 1 && base !== 0)
        // eslint-disable-next-line max-len
        throw new Error(`There is no SINGLE mod inverse for ${base} % ${mod} because ${base} and ${mod} are not co-prime (relatively prime)`);
    const { x } = gcdExtended(base, mod);
    return (x % mod + mod) % mod;
};

// solves linear congruence
// returns x which satisfies ax = b (mod m)
// returns x which satsifies ax % m = b
export const solveLinCongruence = (a: number, b: number, mod: number) => {
    // console.log('a', a, 'b', b, 'mod', mod);
    const inverse = modInverse(a, mod);
    // console.log(`\tans = ${(b * inverse) % mod}`);
    return (b * inverse) % mod;
};

// goes from y = mx + b -> y = -mx + y(-1) = -mx + (-m + b) = [b - m, -m]
export const newStack = (constant: number, slope: number, mod: number): [number, number] =>
    [(constant - slope) % mod, -1 * slope];

// slope doesn't change, but y = mx + b  ->  y = mx + y(n) = mx + mn + b = [mn + b, m]
export const cut = (n: number) => (constant: number, slope: number, mod: number): [number, number] =>
    [(constant + n * slope) % mod, slope];

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
export const increment = (n: number) => (constant: number, slope: number, mod: number): [number, number] =>
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
    const indicesOfInterest = header.slice(3).map(Number);
    return {
        name: header[0],
        size,
        times,
        indicesOfInterest,
        techniques: ini.content.split('\n').filter(s => s.trim() !== '').map(toTechnique)
    };
});

export const applyTechniques =
    (techniques: ((constant: number, slope: number, mod: number) => [number, number])[], size: number) =>
    (initConstant = 0, initSlope = 1) =>
{
    let constant = initConstant;
    let slope = initSlope;
    for (let i = 0; i < techniques.length; i++) {
        [constant, slope] = techniques[i](constant, slope, size);
        // console.log('constant', constant, 'slope', slope);
    }
    // console.log('start', start, 'indexOfInterest', indexOfInterest, 'size', size, '(start - indexOfInterest - 1)', (start - indexOfInterest - 1), '% size', (start - indexOfInterest - 1) % size, 'eq', Math.abs((start - indexOfInterest - 1) % size));
    return { slope, constant };
    // const inRange = (constant + indexOfInterest * slope) % size;
    // return (size + inRange) % size;
};

export const repeatApplication =
    (size: number) =>
    (constant: number, slope: number, times: number) =>
    (indexOfInterest: number) =>
{
    const newSlope = modExp(Math.abs(slope), times, size) * (times % 2 === 0 ? 1 : -1);
    console.log('newSlope', newSlope);
    const newConstant = solveLinCongruence(1, constant * (1 - newSlope) / (1 - slope), size);

    const inRange = (newConstant + indexOfInterest * newSlope) % size;
    return (size + inRange) % size;
};

export const run = () => {
    console.log(timer.start('prime test'));
    console.log(`is ${newDeckSize} prime? ${isPrime(newDeckSize)}`);
    console.log(timer.stop());
    console.log(modExp(-40, 97, 49));
    const sims = getSimulations();
    for (const s of sims) {
        console.log(timer.start(`22b - ${s.name} (size ${chalk.red(s.size + '')} techniques ${chalk.red(s.techniques.length + '')} times ${chalk.red(s.times + '')} index ${chalk.red(s.indicesOfInterest + '')})`));
        const { constant, slope } = applyTechniques(s.techniques, s.size)();
        console.log(applyTechniques(s.techniques, s.size)());
        const finalIndex = s.indicesOfInterest.map(repeatApplication(s.size)(constant, slope, s.times));
        console.log(finalIndex);
        console.log(timer.stop());
    }
};
