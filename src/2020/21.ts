import { assert } from '~/util/assert';
import { PriorityQueue } from '~/util/PriorityQueue';
import { difference, intersect, union } from '~/util/sets';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, pipe } from '~/util/util';
import input from './21.txt';

type Ingredient = string;
type Allergen = string;

interface Simulation {
  name: string;
  ingredients: Set<Ingredient>;
  allergens: Set<Allergen>;
  lines: { ingredients: Set<Ingredient>; allergens: Set<Allergen> }[];
}

function getSimulations(): Simulation[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    let ingredients = new Set<Ingredient>();
    let allergens = new Set<Allergen>();
    const lines: { ingredients: Set<string>; allergens: Set<string> }[] = [];
    for (const line of sim.content) {
      const lineAllergens = new Set(
        assert(line.match(/\(contains (.+?)\)/)?.[1]?.split(', '))
      );
      const lineIngredients = new Set(assert(line.split(' (')[0].split(' ')));
      ingredients = union(ingredients, lineIngredients);
      allergens = union(allergens, lineAllergens);
      lines.push({
        ingredients: lineIngredients,
        allergens: lineAllergens,
      });
    }
    return {
      name: sim.name,
      ingredients,
      allergens,
      lines,
    };
  });
}

export interface AllergenPotential {
  allergen: Allergen;
  potentialIngredientsWithAllergen: {
    ingredient: Ingredient;
    count: number;
  }[];
  likelyIngredientFiguredOut: boolean;
}

function getPotentialIngredientsForAllergens(
  sim: Simulation
): Map<Allergen, Map<Ingredient, number>> {
  // For each allergen, store how often each ingredient appears.
  const map = new Map<Allergen, Map<Ingredient, number>>();

  for (const line of sim.lines) {
    for (const allergen of line.allergens) {
      const potentialIngredients =
        map.get(allergen) ?? new Map<Ingredient, number>();
      for (const ingredient of line.ingredients) {
        const count = potentialIngredients.get(ingredient) ?? 0;
        potentialIngredients.set(ingredient, count + 1);
      }
      map.set(allergen, potentialIngredients);
    }
  }

  // From each allergen (e.g., dairy), remove all ingredients that definitely
  // cannot be dairy. If mx shows dairy 2 times, but kf shows it 1 time, then kf
  // can't be dairy.
  for (const [allergen, ingredientMap] of map.entries()) {
    const max = Math.max(...Array.from(ingredientMap.values()));
    const filteredIngredientMap = new Map(
      Array.from(ingredientMap.entries()).filter(([, v]) => v === max)
    );
    map.set(allergen, filteredIngredientMap);
  }

  return map;
}

function getIngredientsWithNoAllergens(
  potentialIngredientsForAllergens: Map<Allergen, Map<Ingredient, number>>,
  sim: Simulation
): Set<Ingredient> {
  let ingredientsWithAllergens = new Set<Ingredient>();
  for (const ingredientMap of potentialIngredientsForAllergens.values()) {
    ingredientsWithAllergens = union(
      ingredientsWithAllergens,
      new Set(ingredientMap.keys())
    );
  }

  return difference(sim.ingredients, ingredientsWithAllergens);
}

function getIngredientFrequency(ingredients: Set<string>, sim: Simulation) {
  return sim.lines.reduce(
    (sum, line) => sum + intersect(line.ingredients, ingredients).size,
    0
  );
}

// part 2
function getIngredientsWithAllergens(
  potentialIngredientsForAllergens: Map<Allergen, Map<Ingredient, number>>
): string {
  // Get the allergen that has the fewest potential ingredients first.
  const queue = new PriorityQueue<{
    allergen: Allergen;
    ingredients: Set<Ingredient>;
  }>((item) => -1 * item.ingredients.size);
  queue.values = Array.from(potentialIngredientsForAllergens.entries()).map(
    ([k, v]) => ({
      allergen: k,
      ingredients: new Set(v.keys()),
    })
  );

  const result: { allergen: Allergen; ingredient: Ingredient }[] = [];
  // O(n^2)
  while (!queue.isEmpty()) {
    const { allergen, ingredients } = queue.dequeue()!; // O(logn)
    // This allergen has already been solved for in the for-loop below, so
    // remove it.
    if (ingredients.size === 0) continue;
    // Initially, all but one allergen will have multiple potential
    // ingredients. But once we pull out that ONE allergen that only has one
    // possible ingredient, AND THEN remove that ingredient from all the other
    // allergens, there will now exist ANOTHER allergen that has just one
    // ingredient.
    if (ingredients.size !== 1) {
      throw new Error('Cannot figure it out. Abort!');
    }
    const ingredient = Array.from(ingredients)[0];
    result.push({ allergen, ingredient });
    // Iterate the rest of the queue, removing the ingredient we now know what
    // allergen it's for.
    for (const remainingAllergens of queue.values) {
      remainingAllergens.ingredients.delete(ingredient);
    }
    // Heapify the queue again so the top item is an allergen with just one
    // potential ingredient.
    queue.heapify(); // O(n)
  }
  return result
    .sort((a, b) => a.allergen.localeCompare(b.allergen))
    .map((item) => item.ingredient)
    .join(',');
}

export function run() {
  const sims = getSimulations();
  declareProblem('day 21');
  for (const sim of sims) {
    timer.run(
      () =>
        getIngredientFrequency(
          getIngredientsWithNoAllergens(
            getPotentialIngredientsForAllergens(sim),
            sim
          ),
          sim
        ),
      sim.name
    );
  }
  declareProblem('day 21 PART 2');
  for (const sim of sims) {
    timer.run(
      pipe(getPotentialIngredientsForAllergens, getIngredientsWithAllergens),
      sim.name,
      sim
    );
  }
}
