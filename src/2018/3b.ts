import { getSimulations, IClaim } from '~/2018/3';
import { toKey, add } from '~/2019/10';
import { timer } from '~/util/Timer';

const getClaimWithNoOverlap = (claims: IClaim[]) => {
    const pointToClaim = new Map<string, number>();
    const claimsWithNoOverlap = claims.reduce((a, c) => a.add(c.id), new Set<number>());

    for (const claim of claims) {
        for (let w = 0; w < claim.width; w++)
            for (let h = 0; h < claim.height; h++) {
                const p = toKey(add(claim.topLeft)({col: w, row: h}));
                if (pointToClaim.has(p)) {
                    claimsWithNoOverlap.delete(claim.id);
                    claimsWithNoOverlap.delete(pointToClaim.get(p)!);
                }
                pointToClaim.set(p, claim.id);
            }
    }
    return Array.from(claimsWithNoOverlap);
};

export const run = () => {
    const sims = getSimulations().slice(0, 1);
    for (const s of sims) {
        console.log(timer.start(`day 3 name=${s.name} claims=${s.claims.length}`));
        console.log(getClaimWithNoOverlap(s.claims));
        console.log(timer.stop());
    }
};
