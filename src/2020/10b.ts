import { timer } from '~/util/Timer';
import { Simulation, getSimulations } from './10';

function countAdapterConfigurations({ adapters }: Simulation) {
  const dp = [] as number[];
  // we need to add the outlet of 0 jolts to it.
  const sortedAdapters = [...adapters, 0].sort((a, b) => a - b);

  for (let i = sortedAdapters.length - 1; i >= 0; i--) {
    const curr = sortedAdapters[i];
    // the prev one has to fewer than 3 jolts away.
    dp[i] = dp[i + 1] ?? 1;

    if (sortedAdapters[i + 2] - curr <= 3) {
      dp[i] += dp[i + 2];
    }
    if (sortedAdapters[i + 3] - curr <= 3) {
      dp[i] += dp[i + 3];
    }
  }
  return dp[0];
}

export function run() {
  getSimulations().forEach((sim) =>
    timer.run(countAdapterConfigurations, `day 10b - ${sim.name}`, sim)
  );
}
