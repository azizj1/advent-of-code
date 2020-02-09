import { getSimulations, ISimulation, getOrderedToplogicalSortQueue } from '~/2018/7';
import { declareProblem, dropConsoleInfo, resetConsoleInfo } from '~/util/util';
import { timer } from '~/util/Timer';
import chalk from 'chalk';

const makeGetTimeNeeded =
    (minSeconds: number) =>
    (node: string) =>
        node.charCodeAt(0) - 'A'.charCodeAt(0) + 1 + minSeconds;

const getTimeToDoParallelWork = ({graph, minSeconds, numOfWorkers}: ISimulation) => {
    const queue = getOrderedToplogicalSortQueue(graph);
    const getTimeNeeded = makeGetTimeNeeded(minSeconds);
    const workers: {node: string; timeNeeded: number}[] = [];
    let timeLapsed = 0;

    // keep looping even if the queue is empty to increment the timeLapsed
    while (!queue.isEmpty() || workers.length > 0) {
        console.info(`==LOADING WORKERS at ${timeLapsed}==`);
        // free up any workers that are done, and update remaining nodes
        // still in queue to tell 'em the job is done
        for (let i = 0; i < workers.length; i++) {
            if (workers[i].timeNeeded <= timeLapsed) {
                console.info(`${chalk.red('Removing')} node ${JSON.stringify(workers[i])}`);
                queue.values.forEach(v => v.mustBeAfter.delete(workers[i].node));
                workers.splice(i, 1);
                i--; // stay at current index if we remove a worker
            }
        }
        queue.heapify();
        // if there are available workers and jobs that can be started
        while (
            workers.length < numOfWorkers &&
            !queue.isEmpty() &&
            queue.peek()!.mustBeAfter.size === 0
        ) {
            const { node, mustBeAfter } = queue.dequeue()!;
            workers.push({node, timeNeeded: timeLapsed + getTimeNeeded(node)});

            console.info(chalk.green('Added'), 'node', node, 'mustBeAfter', mustBeAfter, 'timeNeeded', timeLapsed + getTimeNeeded(node));
        }

        console.info(workers);
        console.info('==LOADED WORKERS==');
        timeLapsed++;
    }
    return timeLapsed - 1;
};

export const run = () => {
    const sims = getSimulations();
    declareProblem('7b');
    dropConsoleInfo();
    for (const s of sims) {
        console.log(timer.start(`name=${s.name}`));
        console.log(getTimeToDoParallelWork(s));
        console.log(timer.stop());
    }
    resetConsoleInfo();
};
