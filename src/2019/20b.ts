import { getSimulations, IMaze, makeIsValid, entranceKey, exitKey } from '~/2019/20';
import { timer } from '~/util/Timer';
import { toKey, IPoint } from '~/2019/10';
import chalk from 'chalk';
import { WGraph } from '~/util/WeightedGraph';
import { PriorityQueue } from '~/util/PriorityQueue';
import { getNeighbors, equals } from '~/2019/18';
import { first, dropConsoleInfo, resetConsoleInfo } from '~/util/util';

export const toStringWithInnerOuterColor = (s: IMaze) =>
    s.grid
        .map((r, row) =>
            r.map((c, col) =>
                !s.portalLocations.has(toKey({col, row})) ?
                    c :
                    s.portalLocations.get(toKey({col, row}))!.isInner ? chalk.green('I') : chalk.red('X')
            ).join('')
        ).join('\n');

const toGraph = ({entrance, exit, grid, portals, portalLocations}: IMaze) => {
    const graph = new WGraph<string, number>(); // weight is steps between portals
    const queue = new PriorityQueue<{at: IPoint; lastPortal: string; steps: number; level: number}>(p => -1 * p.steps);
    const visited = new Map<string, number>(); // IPoint,level -> distance from entrance
    const isValid = makeIsValid(grid, entrance);

    queue.enqueue({at: entrance, steps: 0, lastPortal: entranceKey, level: 0});
    visited.set(toKey(entrance) + '|0', 0); // visited is now key|level

    while (!queue.isEmpty()) {
        const { at, steps, lastPortal, level } = queue.dequeue()!;
        if (equals(at, exit) && level === -1) // Z is at level 0, and it'll do level - 1 = -1
            break; // done

        const neighbors = getNeighbors(at).filter(isValid);
        for (const neighbor of neighbors) {
            const neighborStr = toKey(neighbor);
            const newSteps = steps + 1;
            const visitedKey = neighborStr + '|' + level;

            if (!visited.has(visitedKey) || visited.get(visitedKey)! > newSteps) {
                const neighborAtPortal = portalLocations.get(neighborStr);

                if (neighborAtPortal != null) {
                    const neighborPortalName = neighborAtPortal.key;
                    if (neighborPortalName === lastPortal)
                        continue;

                    const portalTo = first(portals.get(neighborPortalName)!.filter(p => !equals(p, neighbor)));
                    const newLevel = neighborAtPortal.isInner ? level + 1 : level - 1;

                    if ((neighborPortalName === entranceKey || neighborPortalName === exitKey) && level !== 0) {
                        visited.set(visitedKey, newSteps);
                        continue;
                    }
                    if (!neighborAtPortal.isInner && level === 0 && neighborPortalName !== exitKey) {
                        visited.set(visitedKey, newSteps);
                        continue;
                    }

                    queue.enqueue({
                        at: portalTo ?? neighbor, // possible if portal === 'ZZ'
                        lastPortal: neighborPortalName,
                        steps: newSteps + 1,
                        level: newLevel
                    });
                    graph.addDirectedEdge(lastPortal, neighborPortalName, newSteps);
                    visited.set(toKey(portalTo) + '|' + newLevel, newSteps);
                }
                else {
                    queue.enqueue({
                        at: neighbor,
                        lastPortal: lastPortal,
                        steps: newSteps,
                        level
                    });
                }
                visited.set(visitedKey, newSteps);
            }
        }

    }
    return graph;
};

export const run = () => {
    dropConsoleInfo();
    const sims = getSimulations().slice(3, 4);
    for (const s of sims) {
        console.log(timer.start(`20 - ${s.name}`));
        // console.info(toStringWithInnerOuterColor(s));
        const graph = toGraph(s);
        console.log(graph.toString(n => n?.toString() ?? ''));
        console.log(s.portalLocations);
        console.log(timer.stop());
    }
    resetConsoleInfo();
};
