from timeit import default_timer as timer
from pulp import LpMaximize, LpProblem, LpStatus, LpVariable, GLPK

"""
from https://realpython.com/linear-programming-python/

 Solve the following as an example/warm-up
 max z = x + 2y
   2x + y <= 20
  -4x + 5y <= 10
   -x + 2y >= -2
   -x + 5y = 15
         x >= 0
         y >= 0

WATCH via nodemon:
nodemon --exec python3 21-playground.py
"""

model = LpProblem(sense=LpMaximize)
# cat="Binary" for binary; default is continuous
x = LpVariable(name="x", lowBound=0, cat="Integer")
y = LpVariable(name="y", lowBound=0)

model += (2 * x + y <= 20)
model += (4 * x - 5 * y >= -10)
model += (-x + 2 * y >= -2)
model += (-x + 5 * y == 15)

# Alternatively, you can add problems like this:
# lpSum([x, 2 * y]), whch is more systematic. It'll just sum every item in the
# array, so x + 2 * y
obj_func = x + 2 * y
model += obj_func

start = timer()
# solver is optional. Can also solve it like this:
# status = model.solve()
status = model.solve(solver=GLPK(msg=False))
end = timer()
print(f"status: {model.status}, {LpStatus[model.status]}")
print(f"objective: {model.objective.value()}")
print(f"Elapsed time (ms): {(end - start) * 1000}")

for var in model.variables():
    print(f"{var.name}: {var.value()}")
