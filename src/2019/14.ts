import input from './14.txt';
import { getRunsFromIniFile, last, first } from '~/util/util';
import { WGraph } from '~/util/WeightedGraph';
import { timer } from '~/util/Timer';
import { Queue } from '~/util/Queue';

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

export const getOresForFuelDelete = (graph: WGraph<string, IRatio>) => {
    const fuel = 'FUEL';
    const ore = 'ORE';
    const queue = new Queue<string>();
    const visited = new Set<string>();
    const needs = new Map<string, number>();

    for (const v of graph.vertices)
        needs.set(v, 0);

    queue.enqueue(fuel);
    needs.set(fuel, 1);
    visited.add(fuel);

    while (!queue.isEmpty()) {
        const material = queue.dequeue()!;
        // console.log(`EXAMINING ${material}`);
        const productNeed = needs.get(material)!;
        const reactants = graph.getAdjList(material);

        if (reactants.length === 0)
            continue;

        const { product: productQuantity } = graph.getWeight(material, first(reactants))!;
        const multiplier = Math.ceil(productNeed / productQuantity);

        for (const reactant of reactants) {
            const reactantNeed = needs.get(reactant) ?? 0;
            const { reactant: reactantQuantity } = graph.getWeight(material, reactant)!;
            if (!visited.has(material))
                needs.set(reactant, reactantNeed + multiplier * reactantQuantity);
            else if (reactantNeed <= multiplier * reactantQuantity)
                needs.set(reactant, multiplier * reactantQuantity);

            // if (!visited.has(reactant))
                queue.enqueue(reactant);
        }
        visited.add(material);
        // console.log(needs);

    }

    return needs.get(ore);
};

export const getOresForFuel = (graph: WGraph<string, IRatio>, fuelNeeded = 1) => {
    const fuel = 'FUEL';
    const ore = 'ORE';
    const needsHaves = new Map(graph.vertices.map<[string, [number, number]]>(v => [v, [0, 0]]));

    const helper = (node: string) => {
        if (graph.getAdjList(node).length === 0)
            return;

        const reactants = graph.getAdjList(node);
        const [need, have] = needsHaves.get(node)!;
        if (have > need)
            return;

        const { product: productMadePerReaction } = graph.getWeight(node, first(reactants))!;
        const multiplier = Math.ceil((need - have) / productMadePerReaction);

        const nowHas = have + productMadePerReaction * multiplier;
        needsHaves.set(node, [need, nowHas]);

        for (const reactant of reactants) {
            const { reactant: reactantNeededPerReaction } = graph.getWeight(node, reactant)!;
            const [rNeed, rHave] = needsHaves.get(reactant)!;
            needsHaves.set(reactant, [rNeed + multiplier * reactantNeededPerReaction, rHave]);
            helper(reactant);
        }
    };
    needsHaves.set(fuel, [fuelNeeded, 0]);
    helper(fuel);
    return needsHaves.get(ore)?.[0] ?? 0;
};

export const run = () => {
    const sims = getSimulations(); // .slice(0, 1);
    for (const s of sims) {
        console.log(timer.start(`14 - ${s.name}`));
        // console.log(s.reactions.toString(w => `(${w?.product},${w?.reactant})`));
        console.log(getOresForFuel(s.reactions));
        console.log(timer.stop());
    }
};

// run();
