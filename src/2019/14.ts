import input from './14.txt';
import { getRunsFromIniFile, last, first } from '~/util/util';
import { WGraph } from '~/util/WeightedGraph';
import { timer } from '~/util/Timer';

interface ISimulation {
    name: string;
    reactions: WGraph<string, IRatio>;
}

interface IReaction {
    reactants: IMaterial[];
    product: IMaterial;
}

interface IMaterial {
    q: number; // quantity
    n: string; // name
}

export interface IRatio {
    product: number;
    reactant: number;
}

export const toGraph = (reactions: IReaction[]) => {
    const graph = new WGraph<string, IRatio>();
    for (const reaction of reactions)
        for (const reactant of reaction.reactants)
            graph.addDirectedEdge(
                reaction.product.n,
                reactant.n,
                { product: reaction.product.q, reactant: reactant.q }
            );
    return graph;
};

export const getSimulations = () => getRunsFromIniFile(input)
    .map(r => ({
        name: r.name,
        reactions: r.content
            .split(/\r?\n/)
            .filter(s => s.trim() !== '')
            .map(l => {
                const eq = Array.from(l.matchAll(/(\d+) (\w+)/g)).map(e => ({q: Number(e[1]), n: e[2]}));
                return {
                    reactants: eq.slice(0, -1),
                    product: last(eq)
                };
            })
    }))
    .map<ISimulation>(s => ({name: s.name, reactions: toGraph(s.reactions)}));

export const getOresForFuel = (graph: WGraph<string, IRatio>, fuelNeeded = 1) => {
    const fuel = 'FUEL';
    const ore = 'ORE';
    const needsHaves =
        new Map(graph.vertices.map<[string, [number, number]]>(v => [v, [0, 0]]));

    const helper = (node: string) => {
        if (graph.getAdjList(node).length === 0)
            return;

        const [need, have] = needsHaves.get(node)!;
        if (have > need)
            return;

        const reactants = graph.getAdjList(node);
        // for equation 4D + 3C -> 5B, we'll have the following edges,
        // assuming node = B, reactants = C, D
        //      B to C, weight: { product: 5, reactant: 3 }
        //      B to D, weight: { product: 5, reactant: 4 }
        // so we just do first(reactants) because all weights will have a product = 5
        const { product: productMadePerReaction } = graph.getWeight(node, first(reactants))!;
        const multiplier = Math.ceil((need - have) / productMadePerReaction);

        const nowHas = have + productMadePerReaction * multiplier;
        needsHaves.set(node, [need, nowHas]);

        for (const reactant of reactants) {
            const { reactant: reactantNeededPerReaction } = graph.getWeight(node, reactant)!;
            const [rNeed, rHave] = needsHaves.get(reactant)!;
            // keep the 'have's for the reactant the same, but increase the need for the
            // reactants because we increased the 'have's for the product. E.g., if 4D + 3C -> 5B,
            // and we made 10 Bs above the for loop, multiplier = 2 and now we need to
            // increase the needs of D by 8 and C by 6.
            needsHaves.set(
                reactant,
                [rNeed + multiplier * reactantNeededPerReaction, rHave]
            );
            helper(reactant);
        }
    };
    needsHaves.set(fuel, [fuelNeeded, 0]);
    helper(fuel);
    return needsHaves.get(ore)?.[0] ?? 0;
};

export const run = () => {
    const sims = getSimulations().slice(0, 1);
    for (const s of sims) {
        console.log(timer.start(`14 - ${s.name}`));
        console.log(s.reactions.toString(w => `(${w?.product},${w?.reactant})`));
        console.log(getOresForFuel(s.reactions));
        console.log(timer.stop());
    }
};
