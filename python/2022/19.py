from timeit import default_timer as timer
from dataclasses import dataclass
from pulp import LpMaximize, LpProblem, LpVariable, PULP_CBC_CMD, LpStatus
from util.util import getRunsFromIniNewlineSep
import pandas as pd
import os
import re


@dataclass
class Blueprint:
  # Eact dict is resourceName -> resourceAmount. E.g.,
  # oreRobot = {'ore': 4, 'clay': 18}
  oreRobot: dict[str, int]
  clayRobot: dict[str, int]
  obsidianRobot: dict[str, int]
  geodeRobot: dict[str, int]

  def __str__(self):
    details = ''
    details += 'oreRobot = ' + ' + '.join([f'{v}*{k}'for k,v in
      self.oreRobot.items()]) +'\n'
    details += 'clayRobot = ' + ' + '.join([f'{v}*{k}'for k,v in
      self.clayRobot.items()]) +'\n'
    details += 'obsidianRobot = ' + ' + '.join([f'{v}*{k}'for k,v in
      self.obsidianRobot.items()]) +'\n'
    details += 'geodeRobot = ' + ' + '.join([f'{v}*{k}'for k,v in
      self.geodeRobot.items()]) +'\n'
    return details

  def __repr__(self):
    return self.__str__()

@dataclass
class Simulation:
  name: str
  blueprints: list[Blueprint]

  def __str__(self):
    details = ''
    details += f'Name       : {self.name}\n'
    details += (
        "blueprints :\n"
        + "\n".join([blueprint.__str__() for blueprint in self.blueprints])
        + "\n"
    )
    return details

  def __repr__(self):
    return self.__str__()

def inputfile() -> str:
    return os.path.dirname(os.path.realpath(__file__)) + '/19.txt'

def getSimulations() -> list[Simulation]:
  sims = getRunsFromIniNewlineSep(inputfile())
  result: list[Simulation] = []
  for [name, contents] in sims:
    blueprints: list[Blueprint] = []

    for line in contents:
      data: dict[str, dict[str, int]] = {}
      matches = re.findall(r'Each ([a-z]+) robot costs (.+?)\.', line)
      assert matches

      for robot, costs in matches:
        data[robot] = {}
        for cost in costs.split(' and '):
          count, resource = cost.split(' ')
          data[robot][resource] = int(count)

      blueprints.append(Blueprint(data['ore'], data['clay'], data['obsidian'],
        data['geode']))
    result.append(Simulation(name, blueprints))
  return result

def solve(blueprint: Blueprint, time = 24) -> float:
  T = time
  model = LpProblem(sense=LpMaximize)

  # How many available resources you have at time 0<=t<=24
  ores = [
    LpVariable(name=f"ores[{i}]", lowBound=0, cat="Integer") for i in range(T + 1)
  ]
  clays = [
    LpVariable(name=f'clays[{i}]', lowBound=0, cat='Integer') for i in range(T + 1)
  ]
  obsidians = [
    LpVariable(name=f'obsidians[{i}]', lowBound=0, cat='Integer') for i in range(T + 1)
  ]
  geodes = [
    LpVariable(name=f'geodes[{i}]', lowBound=0, cat='Integer') for i in range(T + 1)
  ]

  # How many robots you have at time 0<=t<=24
  ore_robots = [
    LpVariable(name=f"ore_robots[{i}]", lowBound=0, cat="Integer")
    for i in range(T + 1)
  ]
  clay_robots = [
    LpVariable(name=f"clay_robots[{i}]", lowBound=0, cat="Integer")
    for i in range(T + 1)
  ]
  obsidian_robots = [
    LpVariable(name=f"obsidian_robots[{i}]", lowBound=0, cat="Integer")
    for i in range(T + 1)
  ]
  geode_robots = [
    LpVariable(name=f"geode_robots[{i}]", lowBound=0, cat="Integer")
    for i in range(T + 1)
  ]

  # Boolean variables. Whether a robot was built or not at time 0<=t<=24
  ore_robots_built = [
    LpVariable(name=f"ore_robots_built[{i}]", cat="Binary") for i in range(T + 1)
  ]
  clay_robots_built = [
    LpVariable(name=f"clay_robots_built[{i}]", cat="Binary") for i in range(T + 1)
  ]
  obsidian_robots_built = [
    LpVariable(name=f"obsidian_robots_built[{i}]", cat="Binary")
      for i in range(T + 1)
  ]
  geode_robots_built = [
    LpVariable(name=f"geode_robots_built[{i}]", cat="Binary") for i in range(T + 1)
  ]

  ####### CONSTRAINTS #######
  # Initially, you have nothing at time = 0 but one ore robot.
  model += (ores[0] == 0)
  model += (clays[0] == 0)
  model += (obsidians[0] == 0)
  model += (geodes[0] == 0)

  model += (ore_robots[0] == 1)
  model += (clay_robots[0] == 0)
  model += (obsidian_robots[0] == 0)
  model += (geode_robots[0] == 0)

  model += (ore_robots_built[0] == 0)
  model += (clay_robots_built[0] == 0)
  model += (obsidian_robots_built[0] == 0)
  model += (geode_robots_built[0] == 0)

  # Ores at time t is equal to ores at t-1 plus # of ore robots at t-1
  # MINUS all the ores used at time t.
  for t in range(1, T + 1):
    model += (
      ores[t]
      == ores[t - 1]
      + ore_robots[t - 1]
      - blueprint.oreRobot.get("ore", 0) * ore_robots_built[t]
      - blueprint.clayRobot.get("ore", 0) * clay_robots_built[t]
      - blueprint.obsidianRobot.get("ore", 0) * obsidian_robots_built[t]
      - blueprint.geodeRobot.get("ore", 0) * geode_robots_built[t]
    )
    model += (
      clays[t]
      == clays[t - 1]
      + clay_robots[t - 1]
      - blueprint.oreRobot.get("clay", 0) * ore_robots_built[t]
      - blueprint.clayRobot.get("clay", 0) * clay_robots_built[t]
      - blueprint.obsidianRobot.get("clay", 0) * obsidian_robots_built[t]
      - blueprint.geodeRobot.get("clay", 0) * geode_robots_built[t]
    )
    model += (
      obsidians[t]
      == obsidians[t - 1]
      + obsidian_robots[t - 1]
      - blueprint.oreRobot.get("obsidian", 0) * ore_robots_built[t]
      - blueprint.clayRobot.get("obsidian", 0) * clay_robots_built[t]
      - blueprint.obsidianRobot.get("obsidian", 0) * obsidian_robots_built[t]
      - blueprint.geodeRobot.get("obsidian", 0) * geode_robots_built[t]
    )
    model += (geodes[t] == geodes[t - 1] + geode_robots[t - 1])

  # Ores built at time t is equal to ores built at t-1 + robots built at t-1.
  for t in range(1, T + 1):
    model += (ore_robots[t] == ore_robots[t - 1] + ore_robots_built[t - 1])
    model += (clay_robots[t] == clay_robots[t - 1] + clay_robots_built[t - 1])
    model += (obsidian_robots[t] == obsidian_robots[t - 1] +
        obsidian_robots_built[t - 1])
    model += (geode_robots[t] == geode_robots[t - 1] + geode_robots_built[t - 1])

  # One robot can be built per time t
  for t in range(T + 1):
    model += (ore_robots_built[t] + clay_robots_built[t] +
        obsidian_robots_built[t] + geode_robots_built[t] <= 1)

  obj_func = geodes[T] # Maximize the number of geodes at the end of 24mins
  model += obj_func

  start = timer()
  model.solve(PULP_CBC_CMD(msg=False))
  end = timer()
  # printModel(model, end - start)
  return model.objective.value()

def printModel(model: LpProblem, duration) -> None:
  print(f"status: {model.status}, {LpStatus[model.status]}")
  print(f"Elapsed time (ms): {(duration) * 1000}\n\n")
  allvars = model.variables()
  allvars.sort(key=lambda v:int(re.findall(r'\d+', v.name)[0]))
  df = pd.DataFrame(
    map(
      lambda v: [
        # the names are of the form ores_robot_10_
        re.findall(r"\d+", v.name)[0], # this will be 10
        re.findall(r"^(.+)_\d", v.name)[0], # will be ores_robot
        v.value(),
      ],
      allvars,
    ),
    # the index to these rows will be just the row number, and there are 24 *
    # model vars number of rows.
    columns=["time", "name", "value"],
  # pivot will convert a table with columns time, name, and value
  # where time is [1, 24] and names are ore/clay/obsidian/geode.
  # and the rows are combinations of those. We can pivot similar to
  # Sheets where the first column are unique values of time [1,24]
  # and the other columns are the unique names for the robots and the
  # values are model variables value.
  ).pivot(index="time", columns="name", values="value")
  # print(df) just prints some of the rows. df.to_string() will print all
  print(df.to_string())
  df.to_csv('day19.csv')

def run(sim: Simulation) -> float:
  sum = 0
  for idx, blueprint in enumerate(sim.blueprints):
    obj = solve(blueprint)
    sum += (idx + 1) * obj
    print(idx, obj)
  return sum
sims = getSimulations()

def run2(sim: Simulation) -> float:
  mult = 1
  for idx, blueprint in enumerate(sim.blueprints[:3]):
    obj = solve(blueprint, 32)
    mult *= obj
    print(idx, obj)
  return mult

sims = getSimulations()
print(run(sims[1]))
