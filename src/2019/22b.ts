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
    if (getgcd(base, mod) !== 1)
        // eslint-disable-next-line max-len
        throw new Error(`There is no SINGLE mod inverse for ${base} % ${mod} because ${base} and ${mod} are not co-prime (relatively prime)`);
    const { x } = gcdExtended(base, mod);
    return (x % mod + mod) % mod;
};

// solves linear congruence
// returns x which satisfies ax = b (mod m)
// returns x which satsifies ax % m = b
export const solveLinCongruence = (a: number, b: number, mod: number) => {
    const inverse = modInverse(a, mod);
    return (b * inverse) % mod;
};

export const newStack = (size: number) => (i: number) => size - i - 1;
export const cut = (size: number) => (n: number) => (i: number) => (i + n + size) % size;
export const increment = (size: number) => (n: number) => (i: number) => solveLinCongruence(n, i, size);

const toTechnique = (size: number) => (s: string) => {
    if (s.indexOf('stack') >= 0)
        return newStack(size);
    if (s.indexOf('increment') >= 0)
        return increment(size)(Number(first(s.match(/-?\d+/g) ?? [])));
    if (s.indexOf('cut') >= 0)
        return cut(size)(Number(first(s.match(/-?\d+/g) ?? [])));
    throw new Error('Technique not found');
};

export const getSimulations = () => getRunsFromIniFile(input).map(ini => {
    const header = ini.name.split(',');
    const size = Number(header[1]);
    const indicesOfInterest = header.slice(2).map(Number);
    return {
        name: header[0],
        size,
        indicesOfInterest,
        techniques: ini.content.split('\n').filter(s => s.trim() !== '').map(toTechnique(size))
    };
});

export const applyTechniques = (techniques: ((i: number) => number)[]) => (indexOfInterest: number) => {
    let val = indexOfInterest;
    for (let i = 0; i < techniques.length; i++) {
        let temp = val;
        for (let j = 0; j < i; j++) {
            // console.log(`\ttemp = ${temp} BEFORE applying technique ${j}`);
            temp = techniques[j](temp);
            // console.log(`\ttemp = ${temp} AFTER applying technique ${j}`);
        }
        val = techniques[i](temp);
        // console.log(`val = ${val} after applying technique ${i}`);
    }
    return val;
};

export const run = () => {
    console.log(timer.start('prime test'));
    console.log(`is ${newDeckSize} prime? ${isPrime(newDeckSize)}`);
    console.log(timer.stop());

    const sims = getSimulations().slice(1, 2);
    for (const s of sims) {
        console.log(timer.start(`22b - ${s.name} (size ${chalk.red(s.size + '')} techniques ${chalk.red(s.techniques.length + '')} index ${chalk.red(s.indicesOfInterest + '')})`));
        const finalIndex = s.indicesOfInterest.map(applyTechniques(s.techniques));
        console.log(finalIndex);
        console.log(timer.stop());
    }
};
