import { assert } from '~/util/assert';
import { Queue } from '~/util/Queue';
import { timer } from '~/util/Timer';
import { getRunsFromIniNewlineSep, isNonNull } from '~/util/util';
import input from './19.txt';

interface Cost {
  ore: number;
  clay: number;
  obsidian: number;
}

interface Blueprint {
  oreRobot: Cost;
  clayRobot: Cost;
  obsidianRobot: Cost;
  geodeRobot: Cost;
}

interface Simulation {
  name: string;
  blueprints: Blueprint[];
}

type DropRobot<T> = {
  [K in keyof T as K extends `${infer I}Robot` ? I : K]: T[K];
};

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => ({
    name: sim.name,
    blueprints: sim.content.map((line) => {
      const matches = assert(
        line.matchAll(/Each ([a-z]+) robot costs (.+?)\./g)
      );
      const blueprint: Partial<Blueprint> = {};
      for (const [, robotName, costsStr] of matches) {
        const costObj: Cost = { ore: 0, clay: 0, obsidian: 0 };
        for (const cost of costsStr.split(' and ')) {
          const [amount, costName] = cost.split(' ');
          costObj[costName as keyof Cost] = Number(amount);
        }
        blueprint[(robotName + 'Robot') as keyof Blueprint] = costObj;
      }
      return blueprint as Blueprint;
    }),
  }));
}

interface State {
  resourcesAvailable: {
    ore: number;
    clay: number;
    obsidian: number;
    geode: number;
  };
  robots: {
    ore: number;
    clay: number;
    obsidian: number;
    geode: number;
  };
}

function serialize(state: State, timeRemaining: number) {
  const { resourcesAvailable: ra, robots: r } = state;
  return (
    `${ra.ore},${ra.clay},${ra.obsidian},${ra.geode}` +
    `${r.ore},${r.clay},${r.obsidian},${r.geode},${timeRemaining}`
  );
}

export function solve1(blueprint: Blueprint) {
  let gmaxGeodes = 0; // global max geodes
  // serialized state to # of geodes
  const visited = new Map<string, number>();
  const helper = (state: State, timeRemaining: number): number => {
    if (timeRemaining <= 0) return 0;

    const stateStr = serialize(state, timeRemaining);
    if (visited.has(stateStr)) return visited.get(stateStr)!;
    if (potentialGeodes({ ...state, timeRemaining }) < gmaxGeodes) {
      return 0;
    }

    let newState: State | undefined = collectResources(state);
    let maxGeodes = newState.resourcesAvailable.geode;
    // Option #1: don't build anything. Just have the robots collect resources.
    if (addMoreResources(newState, blueprint)) {
      maxGeodes = Math.max(maxGeodes, helper(newState, timeRemaining - 1));
      gmaxGeodes = Math.max(gmaxGeodes, maxGeodes);
    }
    if ((newState = buildRobot(blueprint, 'geode', state))) {
      // Option#2: See if you can build a geode robot
      maxGeodes = Math.max(maxGeodes, helper(newState, timeRemaining - 1));
      gmaxGeodes = Math.max(gmaxGeodes, maxGeodes);
    }
    if ((newState = buildRobot(blueprint, 'ore', state))) {
      // Option#3: See if you can build an ore robot
      maxGeodes = Math.max(maxGeodes, helper(newState, timeRemaining - 1));
      gmaxGeodes = Math.max(gmaxGeodes, maxGeodes);
    }
    if ((newState = buildRobot(blueprint, 'clay', state))) {
      // Option#4: See if you can build a clay robot
      maxGeodes = Math.max(maxGeodes, helper(newState, timeRemaining - 1));
      gmaxGeodes = Math.max(gmaxGeodes, maxGeodes);
    }
    if ((newState = buildRobot(blueprint, 'obsidian', state))) {
      // Option#5: See if you can build a obsidian robot
      maxGeodes = Math.max(maxGeodes, helper(newState, timeRemaining - 1));
      gmaxGeodes = Math.max(gmaxGeodes, maxGeodes);
    }
    visited.set(stateStr, maxGeodes);
    return maxGeodes;
  };
  const ans = helper(
    {
      resourcesAvailable: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
      robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    },
    24
  );
  return ans;
}

export function solve1bfs(blueprint: Blueprint) {
  // serialized state to # of geodes
  const visited = new Map<string, number>();
  const queue = new Queue<State & { timeRemaining: number }>();
  let maxState = {
    resourcesAvailable: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
    robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    timeRemaining: 24,
  };
  queue.enqueue(maxState);
  visited.set(serialize(maxState, 24), 0);
  while (!queue.isEmpty()) {
    const state = queue.dequeue()!;
    const newState = collectResources(state);
    newState.timeRemaining--;

    if (newState.resourcesAvailable.geode > maxState.resourcesAvailable.geode) {
      maxState = newState;
    }
    if (state.timeRemaining <= 1) continue;
    // Next states with trying to build robots.
    const nextStates = (['ore', 'clay', 'obsidian', 'geode'] as const)
      .map((type) => buildRobot(blueprint, type, state))
      .filter(isNonNull);
    for (const nextState of nextStates) {
      nextState.timeRemaining--;
      if (potentialGeodes(nextState) > maxState.resourcesAvailable.geode) {
        queue.enqueue(nextState);
      }
    }
    if (addMoreResources(newState, blueprint)) {
      queue.enqueue(newState);
    }
  }
  return maxState;
}

/**
 * If you have enough resources to build any robot, don't bother with collecting
 * more resources. You should be building bots + collecting resources at the
 * same time.
 */
function addMoreResources(state: State, blueprint: Blueprint): boolean {
  const { ore, clay, obsidian } = state.resourcesAvailable;
  const { oreRobot, clayRobot, obsidianRobot, geodeRobot } = blueprint;
  if (
    ore <
    Math.max(oreRobot.ore, clayRobot.ore, obsidianRobot.ore, geodeRobot.ore)
  ) {
    return true;
  } else if (
    clay <
    Math.max(oreRobot.clay, clayRobot.clay, obsidianRobot.clay, geodeRobot.clay)
  ) {
    return true;
  } else if (
    obsidian <
    Math.max(
      oreRobot.obsidian,
      clayRobot.obsidian,
      obsidianRobot.obsidian,
      geodeRobot.obsidian
    )
  ) {
    return true;
  }
  return false;
}

function potentialGeodes({
  timeRemaining,
  ...state
}: State & { timeRemaining: number }) {
  const futurePotential =
    timeRemaining <= 1 ? 0 : (timeRemaining * (timeRemaining - 1)) / 2;
  return (
    state.resourcesAvailable.geode +
    state.robots.geode * timeRemaining +
    futurePotential
  );
}

function collectResources<T extends State>(state: T): T {
  const newState = {
    ...state,
    resourcesAvailable: { ...state.resourcesAvailable },
    robots: { ...state.robots },
  };
  newState.resourcesAvailable.ore += newState.robots.ore;
  newState.resourcesAvailable.clay += newState.robots.clay;
  newState.resourcesAvailable.obsidian += newState.robots.obsidian;
  newState.resourcesAvailable.geode += newState.robots.geode;
  return newState;
}

/**
 * @return The updated state after building the specified robot and collecting
 * resources. If the robot cannot be built due to lack of resources, it returns
 * undefined.
 */
function buildRobot<T extends State>(
  blueprint: Blueprint,
  type: keyof DropRobot<Blueprint>,
  state: T
): T | undefined {
  const cost = blueprint[(type + 'Robot') as keyof Blueprint];
  const {
    resourcesAvailable: { ore, clay, obsidian },
  } = state;
  if (ore >= cost.ore && clay >= cost.clay && obsidian >= cost.obsidian) {
    const updatedState = {
      ...state,
      resourcesAvailable: {
        ...state.resourcesAvailable,
        ore: state.resourcesAvailable.ore - cost.ore + state.robots.ore,
        clay: state.resourcesAvailable.clay - cost.clay + state.robots.clay,
        obsidian:
          state.resourcesAvailable.obsidian -
          cost.obsidian +
          state.robots.obsidian,
        geode: state.resourcesAvailable.geode + state.robots.geode,
      },
      robots: { ...state.robots, [type]: state.robots[type] + 1 },
    };
    return updatedState;
  }
  return undefined;
}

export function run() {
  const sims = getSimulations().slice(1);
  for (const sim of sims) {
    for (const [idx, blueprint] of sim.blueprints.entries()) {
      timer.run(() => {
        console.log(solve1(blueprint));
      }, `${sim.name} - ${idx + 1}`);
    }
  }
}
