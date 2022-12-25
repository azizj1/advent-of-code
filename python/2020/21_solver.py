from dataclasses import dataclass
from pulp import LpProblem, LpStatus, LpVariable, lpSum, GLPK
from util.util import getRunsFromIniNewlineSep
import re
import os

@dataclass
class Food:
    allergens: set[str]
    ingredients: set[str]

@dataclass
class Simulation:
    name: str
    ingredients: set[str]
    allergens: set[str]
    lines: list[Food]

    def __str__(self):
        details = ''
        details += f'Name        : {self.name}\n'
        details += f'Ingredients : {len(self.ingredients)}\n'
        details += f'Allergens   : {self.allergens}\n'
        details += f'Lines       : {len(self.lines)}\n'
        return details

    def __repr__(self):
        return self.__str__()

def inputfile() -> str:
    return os.path.dirname(os.path.realpath(__file__)) + '/21.txt'

def getSimulations() -> list[Simulation]:
    sims = getRunsFromIniNewlineSep(inputfile())
    result: list[Simulation] = []
    for [name, contents] in sims:
        ingredients: set[str] = set()
        allergens: set[str] = set()
        foods: list[Food] = []

        for line in contents:
            match = re.search(r'^(.+) \(contains (.+)\)$', line)
            assert match
            ingredientsInFood = set(match.group(1).split(' '))
            allergensInFood = set(match.group(2).split(', '))
            foods.append(Food(allergensInFood, ingredientsInFood))
            ingredients = ingredients.union(ingredientsInFood)
            allergens = allergens.union(allergensInFood)

        current = Simulation(name, ingredients, allergens, foods)
        result.append(current)
    return result

def solve(sim: Simulation) -> None:
    model = LpProblem()
    # x = dict[allergen, dict[ingredient, var]]
    # meaning you can do x['dairy']['mx']
    x = {allergen: {
                ingredient: LpVariable(name=f'x[{allergen}][{ingredient}]',
                    cat='Binary')
                for ingredient in sim.ingredients
            } for allergen in sim.allergens}

    # A given allergen must exist in one and only one ingredient.
    for allergen in sim.allergens:
        model += (lpSum(x[allergen].values()) == 1)
    # An ingredient can have at most one allergen.
    # These constraints are actually not necessary, because they get enforced by
    # the for-loop below.
    for ingredient in sim.ingredients:
        model += (lpSum(map(lambda allergen: x[allergen][ingredient], x.keys())) <= 1)
    # A line like:
    #   mx sb kf (contains dairy, fish)
    # would be an equation like
    #   x[dairy][mx] + x[dairy][sb] + x[dairy][kf] + x[fish][mx] + x[fish][sb] +
    #   x[fish][kf] = 2
    # It equals 2 because dairy and fish mus be somewhere in that list.
    for line in sim.lines:
        model += lpSum(x[allergen][ingredient]
                    for allergen in line.allergens
                    for ingredient in line.ingredients) == len(line.allergens)

    model.solve(solver=GLPK(msg=False))
    print(LpStatus[model.status])
    print(f'solutionTime = {round(model.solutionTime * 1000)}ms')

    for var in filter(lambda var: var.value() is not None and var.value() > 0,
            model.variables()):
        match = re.search(r'^x_([^_]+)__([^_]+)_$', var.name)
        assert match
        print(f'{match.group(1)} in {match.group(2)}')

sims = getSimulations()
for sim in sims:
    solve(sim)
    print()
