import {declareProblem} from '~/util/util';
import { ISimulation, IPosition, makeMoveCart, buildQueue, getSimulations } from './13';

export const moveAllCarts = (s: ISimulation): ISimulation => {
    const getKey = (p: IPosition) => `${p.x},${p.y}`;
    const nextPositions = new Map<string, IPosition>(
        s.carts.values.map(c => [getKey(c), c])
    );
    const queue = s.carts;
    const moveCart = makeMoveCart(s.grid);
    while (!queue.isEmpty()) {
        const pos = queue.dequeue()!;
        const next = moveCart(pos);
        const key = getKey(next);
        nextPositions.delete(getKey(pos)); // delete old position
        // if the new position is already in the Map, means there is a collision
        // with either a moved cart or a cart that hasn't moved yet.
        if (nextPositions.has(key)) {
            nextPositions.delete(key);
            // if you collide with cart not moved yet, it'll be in the queue
            // still, so you need to remove it.
            queue.remove(next);
        } else {
            nextPositions.set(key, next);
        }
    }
    return {
        ...s,
        carts: buildQueue(s.grid, Array.from(nextPositions.values()))
    };
};

export const playSimulation = (s: ISimulation) => {
    let nextSim = s;
    let count = 0;
    do {
        // print(nextSim);
        count++;
        nextSim = moveAllCarts(nextSim as ISimulation);
    } while (nextSim.carts.size() > 1);
    console.log('took', count, 'attempts');
    return nextSim.carts.values;
};

export const run = () => {
    declareProblem('day 13');
    const sims = getSimulations();
    for (const sim of sims) {
       console.log(playSimulation(sim));
    }
};
