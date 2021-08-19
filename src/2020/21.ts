import { assert } from '~/util/assert';
import { BiMap } from '~/util/BiMap';
import { difference, union } from '~/util/sets';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';
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

function ingredientsWithoutAllergens(sim: Simulation) {
  const { lines } = sim;
  const bimap = new BiMap<Ingredient, Allergen>();

  for (const line of lines) {
    // e.g., dairy
    for (const allergen of line.allergens) {
      const potentialIngredients = bimap
        .getKeys(allergen)
        .filter((ing) => line.ingredients.has(ing));

      if (potentialIngredients.length === 0) {
        // add all ingredients to this allergen.
        for (const ingredient of line.ingredients) {
          bimap.set(ingredient, allergen);
        }
      } else if (potentialIngredients.length === 1) {
        // we found a pair!
        const ingredient = potentialIngredients[0];
        bimap.deleteByValue(allergen);
        bimap.deleteByKey(ingredient);
        bimap.set(ingredient, allergen);
      }
    }
  }
  console.log(bimap.toString());
  const resolvedIng = new Set(
    Array.from(bimap.keys()).filter((k) => bimap.getValues(k).length === 1)
  );

  return difference(sim.ingredients, resolvedIng);
}

export function run() {
  declareProblem('day 21');
  const sim = getSimulations()[1];
  timer.run(ingredientsWithoutAllergens, `day 21 - ${sim.name}`, sim);
}
