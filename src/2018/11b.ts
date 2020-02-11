import { declareProblem } from '~/util/util';
import { getSimulations, makeGetLargestPower, ISize } from '~/2018/11';
import { timer } from '~/util/Timer';

const makeAllPowerGrids = (grid: ISize, powerLevelsSizeOne: Map<string, number>) => {
    const { height, width } = grid;
    const allPowerGridsPerSize = new Map([[1, powerLevelsSizeOne]]);
    const helper = (size: number): Map<string, number> => {
        if (allPowerGridsPerSize.has(size))
            return allPowerGridsPerSize.get(size)!;

        const powerLevels = new Map<string, number>();
        const prevPowerLevels = size % 2 === 0 ? helper(size / 2) : helper(size - 1);

        return powerLevels;
    };
};

const getLargestPowerAndSize = (serial: number) => {
    const getLargestPower = makeGetLargestPower({height: 300, width: 300}, serial);
    let maxPower = {coordinate: 'null', power: -1};
    let maxSize = 1;

    for (let size = 1; size <= 300; size++) {
        console.log(`at size = ${size}`);
        const currPower = getLargestPower({height: size, width: size});
        if (currPower.power > maxPower.power) {
            maxPower = currPower;
            maxSize = size;
        }
    }

    return `${maxPower.coordinate},${maxSize}`;
};

export const run = () => {
    declareProblem('2018 11b');
    for (const s of getSimulations()) {
        console.log(timer.start(`name=${s.name},serial=${s.serial}`));
        console.log(getLargestPowerAndSize(s.serial));
        console.log(timer.stop());
    }
};
