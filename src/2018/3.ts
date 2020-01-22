import { IPoint, toKey, add } from '~/2019/10';
import { getRunsFromIniFile } from '~/util/util';
import input from './3.txt';
import { timer } from '~/util/Timer';

export interface IClaim {
    id: number;
    topLeft: IPoint;
    width: number;
    height: number;
}

interface ISimulation {
    name: string;
    claims: IClaim[];
}

export const getSimulations = (): ISimulation[] => getRunsFromIniFile(input).map(({name, content}) => ({
    name,
    claims: content
        .split(/\r?\n/)
        .filter(s => s.trim() !== '')
        .map(c => {
            const [, id, left, top, width, height] =
                c.match(/^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)$/)?.map(Number) ?? [];
            return {
                id,
                width,
                height,
                topLeft: {
                    row: top,
                    col: left
                }
            };
    })
}));

const getAreasOverlapping = (claims: IClaim[]) => {
    let overlappingAreas = 0;
    const areaCount = new Map<string, number>();

    for (const claim of claims) {
        for (let w = 0; w < claim.width; w++)
            for (let h = 0; h < claim.height; h++) {
                const p = toKey(add(claim.topLeft)({col: w, row: h}));
                if (areaCount.get(p) === 1)
                    overlappingAreas++;
                areaCount.set(p, (areaCount.get(p) ?? 0) + 1);
            }
    }
    return overlappingAreas;
};

export const run = () => {
    const sims = getSimulations().slice(-1);
    for (const s of sims) {
        console.log(timer.start(`day 3 name=${s.name} claims=${s.claims.length}`));
        // console.log(s.claims);
        console.log(getAreasOverlapping(s.claims));
        console.log(timer.stop());
    }
};
