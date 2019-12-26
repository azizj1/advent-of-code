import input from './12.txt';
import { timer } from '~/util/Timer';

export interface IPoint3D {
    x: number;
    y: number;
    z: number;
}

export interface ISimulation {
    name: string;
    moons: IPoint3D[];
    steps: number;
}

export const add = (a: IPoint3D) => (b: IPoint3D) => ({x: a.x + b.x, y: a.y + b.y, z: a.z + b.z});
export const subtract = (a: IPoint3D) => (b: IPoint3D) => ({x: a.x - b.x, y: a.y - b.y, z: a.z - b.z});
export const cDelta = (a: number, b: number) => a > b ? -1 : a < b ? 1 : 0;
export const delta = (a: IPoint3D, b: IPoint3D) => ({
    x: cDelta(a.x, b.x),
    y: cDelta(a.y, b.y),
    z: cDelta(a.z, b.z)
});

export const ans = (moons: IPoint3D[], steps: number) => {
    const velocities = Array.from({length: moons.length}, () => ({x: 0, y: 0, z: 0}));
    while (steps-- > 0) {
        // velocities update
        for (let i = 0; i < moons.length; i++) {
            for (let j = i + 1; j < moons.length; j++) {
                const v = delta(moons[i], moons[j]);
                velocities[i] = add(velocities[i])(v);
                velocities[j] = subtract(velocities[j])(v);
            }
        }

        // distance
        for (let i = 0; i < moons.length; i++)
            moons[i] = add(moons[i])(velocities[i]);
    }
    // energy
    let energy = 0;
    for (let i = 0; i < moons.length; i++) {
        const pot = Math.abs(moons[i].x) + Math.abs(moons[i].y) + Math.abs(moons[i].z);
        const kin = Math.abs(velocities[i].x) + Math.abs(velocities[i].y) + Math.abs(velocities[i].z);
        energy += pot * kin;
    }
    return energy;
};

export const getSimsFromFile = () => {
    const sims: ISimulation[] = [];
    const matches = input.matchAll(/\[([^\]]+)\]\r?\n?((?:<[^>]+>\r?\n?)+)/ig);
    for (const match of matches)
        sims.push({
            name: match[1].split(',')[0],
            steps: Number(match[1].split(',')[1]),
            moons: Array.from(match?.[2]?.matchAll(/<([^>]+)>/ig) ?? [])
                .map(m => m[1].split(', '))
                .map(p => ({
                    x: Number(p[0].split('=')[1]),
                    y: Number(p[1].split('=')[1]),
                    z: Number(p[2].split('=')[1])
                }))
        });
    return sims;
};

export const run = () => {
    const sims = getSimsFromFile();
    for (const s of sims) {
        console.log(timer.start(`${s.name} with ${s.steps} steps`));
        console.log(ans(s.moons, s.steps));
        console.log(timer.stop());
    }
};

run();
