import { WGraph } from '~/util/WeightedGraph';
import { IRatio, getSimulations, getOresForFuel } from '~/2019/14';
import { timer } from '~/util/Timer';

export const maxFuelFrom = (graph: WGraph<string, IRatio>, oresAvailable: number) => {
    const oresPerFuel = getOresForFuel(graph, 1);
    if (oresAvailable < oresPerFuel)
        return 0;

    // first guess. If it takes 30 ores to make 1 fuel, and 90 ores are available, your upperbound would be
    // 90 / 30 = 3 fuels. However, it's very likely you'll make way more than 3 fuels because there are usually spare
    // materials when making just 1 fuel, which can be reused to make the second fuel, and so on.
    let fuelGuess = Math.floor(oresAvailable / oresPerFuel);
    let oresFromFuelGuess = getOresForFuel(graph, fuelGuess);

    while (oresAvailable > oresFromFuelGuess) {
        // line below this will tell us how many fuels we are off by
        const fuelGuessAddition = Math.ceil((oresAvailable - oresFromFuelGuess) / oresPerFuel) + 1;
        fuelGuess += fuelGuessAddition;
        oresFromFuelGuess = getOresForFuel(graph, fuelGuess);
        // console.log(`fuelGuess=${fuelGuess}\toresFromFuelGuess=${oresFromFuelGuess}\taddition=${fuelGuessAddition}`);
    }

    // if our guess of ores went over the requiredNumOfOres
    while (oresFromFuelGuess > oresAvailable) {
        fuelGuess--;
        oresFromFuelGuess = getOresForFuel(graph, fuelGuess);
        // console.log(`fuelGuess=${fuelGuess}\toresFromFuelGuess=${oresFromFuelGuess}\taddition=-1`);
    }

    return {
        oresPerFuel: oresPerFuel.toLocaleString(),
        maxFuel: fuelGuess.toLocaleString(),
        oresUsed: oresFromFuelGuess.toLocaleString(),
        leftOver: (oresAvailable - oresFromFuelGuess).toLocaleString()
    };
};

export const run = () => {
    const ores = 1_000_000_000_000;
    const sims = getSimulations(); // .slice(0, 1);
    for (const s of sims) {
        console.log(timer.start(`14b - ${s.name}`));
        console.log(maxFuelFrom(s.reactions, ores));
        console.log(timer.stop());
    }
};

run();
