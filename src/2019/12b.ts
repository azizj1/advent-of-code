import { IPoint3D, cDelta, getSimsFromFile } from '~/2019/12';
import { timer } from '~/util/Timer';
import { getgcd } from '~/2019/10';

export const runComponentSimulation = (moons: IPoint3D[], c: (moon: IPoint3D) => number, steps: number) => {
    const v = Array.from({length: moons.length}, () => 0);
    const ms = moons.map(c);
    while (steps-- > 0) {
        // velocities
        for (let i = 0; i < moons.length; i++)
            for (let j = i + 1; j < moons.length; j++) {
                const delta = cDelta(ms[i], ms[j]);
                v[i] += delta;
                v[j] -= delta;
            }

        // distance
        for (let i = 0; i < moons.length; i++)
            ms[i] += v[i];
    }
    return {final: ms, v};
};

export const runSimulation = (moons: IPoint3D[], steps: number) => {
    const xs = runComponentSimulation(moons, m => m.x, steps);
    const ys = runComponentSimulation(moons, m => m.y, steps);
    const zs = runComponentSimulation(moons, m => m.z, steps);
    let energy = 0;
    for (let i = 0; i < moons.length; i++) {
        const pot = Math.abs(xs.final[i]) + Math.abs(ys.final[i]) + Math.abs(zs.final[i]);
        const kin = Math.abs(xs.v[i]) + Math.abs(ys.v[i]) + Math.abs(zs.v[i]);
        energy += pot * kin;
    }
    return energy;
};

export const stepsForComponent = (moons: IPoint3D[], c: (moon: IPoint3D) => number) => {
    const ms = moons.map(c);
    const v = Array.from({length: moons.length}, () => 0);
    let steps = 0;
    while (steps++ < Number.MAX_SAFE_INTEGER) {
        // velocities
        for (let i = 0; i < moons.length; i++) {
            for (let j = i + 1; j < moons.length; j++) {
                const delta = cDelta(ms[i], ms[j]);
                v[i] += delta;
                v[j] -= delta;
            }
        }

        // distance
        for (let i = 0; i < moons.length; i++)
            ms[i] += v[i];

        if (v.every(vi => vi === 0) && ms.every((m, i) => c(moons[i]) === m))
            return steps;
    }
    return Infinity;
};

export const lcm = (...n: number[]) => {
    return n.reduce((a, c) => a * c / getgcd(a, c), 1);
};

export const getStepsForCircle = (moons: IPoint3D[]) => lcm(
    stepsForComponent(moons, m => m.x),
    stepsForComponent(moons, m => m.y),
    stepsForComponent(moons, m => m.z)
);

export const run = () => {
    const sims = getSimsFromFile();
    for (const s of sims) {
        console.log(timer.start(`12b - ${s.name}`));
        console.log(getStepsForCircle(s.moons));
        console.log(timer.stop());
        // return;
    }
    console.log(lcm(6, 6, 6));
};

run();
