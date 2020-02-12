import { IPoint, toKey, add } from '~/2019/10';
import { declareProblem } from '~/util/util';
import { timer } from '~/util/Timer';

export const getSimulations = () => [{
    serial: 8,
    name: '1'
}, {
    serial: 2187,
    name: 'input'
}, {
    serial: 18,
    name: '2'
}, {
    serial: 42,
    name: '3'
}];

const makeGetPower = (serial: number) => ({row, col}: IPoint) => {
    const rackId = (col + 1) + 10;
    let power = (row + 1) * rackId + serial;
    power *= rackId;
    power = Math.trunc(power / 100) % 10;
    return power - 5;
};

export interface ISize {
    width: number;
    height: number;
}

const makeGetTotalPower = (square: ISize, powerLevels: Map<string, number>) => (from: IPoint) => {
    let totalPower = 0;
    for (let i = 0; i < square.height; i++)
        for (let j = 0; j < square.width; j++)
            totalPower += powerLevels.get(toKey(add(from)({row: i, col: j})))!;
    return totalPower;
};

export const getPowerLevels = (grid: ISize, serial: number) => {
    const powerLevels = new Map<string, number>();
    const getPower = makeGetPower(serial);
    for (let i = 0; i < grid.height; i++)
        for (let j = 0; j < grid.width; j++) {
            const p = {row: i, col: j};
            powerLevels.set(toKey(p), getPower(p));
        }
    return powerLevels;
};

export const makeGetLargestPower = (grid: ISize, serial: number) => {
    const powerLevels = getPowerLevels(grid, serial);
    return (square: ISize) => {
        let maxPower = -1;
        let maxPowerPoint = {row: 0, col: 0};
        const getTotalPower = makeGetTotalPower(square, powerLevels);
        for (let i = 0; i < grid.height - square.height; i++)
            for (let j = 0; j < grid.width - square.width; j++) {
                const p = {row: i, col: j};
                const curr = getTotalPower(p);
                if (curr > maxPower) {
                    maxPower = curr;
                    maxPowerPoint = p;
                }
            }

        const offsettedMax = add(maxPowerPoint)({row: 1, col: 1});
        return {coordinate: `${offsettedMax.col},${offsettedMax.row}`, power: maxPower };
    };
};

export const run = () => {
    declareProblem('2018 day 11');
    for (const s of getSimulations()) {
        console.log(timer.start(`name=${s.name},serial=${s.serial}`));
        console.log(makeGetLargestPower({height: 300, width: 300}, s.serial)({height: 3, width: 3}));
        console.log(timer.stop());
    }
};
