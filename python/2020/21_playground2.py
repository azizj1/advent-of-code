from timeit import default_timer as timer
from pulp import LpMaximize, LpProblem, LpStatus, LpVariable, lpSum

"""
https://realpython.com/linear-programming-python/

Say that a factory produces four different products, and that the daily produced
amount of the first product is x_1, the amount produced of the second product is
x_2, and so on. The goal is to determine the profit-maximizing daily production
amount for each product, bearing in mind the following conditions:

The profit per unit of product is $20, $12, $40, and $25 for the first, second,
third, and fourth product, respectively.

Due to manpower constraints, the total number of units produced per day can’t
exceed fifty.

For each unit of the first product, three units of the raw material A are
consumed. Each unit of the second product requires two units of the raw material
A and one unit of the raw material B. Each unit of the third product needs one
unit of A and two units of B. Finally, each unit of the fourth product requires
three units of B.

Due to the transportation and storage constraints, the factory can consume up to
one hundred units of the raw material A and ninety units of B per day.

    max z = 20x1 + 12x2 + 40x3 + 25x4
    x1 + x2 + x3 + x4 <= 50
    3x1 + 2x2 + x3 <= 100
    x2 + 2x3 + 3x4 <= 90
    x1,x2,x3,x4 >= 0

FURTHERMORE,

Factory can't make x_1 and _x3 the same day due to machinery issues. So let's
introduce some binary variables:

    y_1 = {1 if x_1 is made today}
    y_3 = {1 if x_3 is made today}

The obvious constraint is

    y_1 + y_3 <= 1

How do you relate y_1 to x_1? and y_3 to x_3?
Think of it this way: If y_1 == 0, then x_1 = 0. If y_1 == 1, then x_1 >= 0:

    x_1 <= M*y_1
    x_3 <= M*y_3

Where M is some really large number x_1/3 can't exceed.

WATCH via nodemon:
nodemon --exec python3 21-playground.py
"""

# WATCH via nodemon:
# nodemon --exec python3 21.py

model = LpProblem(sense=LpMaximize)
# This is a DICTIONARY, where the key is the number. range(1,5) is [1,2,3,4]; 5
# is not included.
x = {i: LpVariable(name=f"x{i}", lowBound=0) for i in range(1,5)}
# This is NOT a range. (1,3) is a tuple, so y[1] and [3] are the only valid
# dict keys.
y = {i: LpVariable(name=f"y{i}", lowBound=0, cat="Binary") for i in (1,3)}

model += (lpSum(x.values()) <= 50)
model += (3 * x[1] + 2 * x[2] + x[3] <= 100)
model += (x[2] + 2 * x[3] + 3 * x[4] <= 90)

M = 100
model += (x[1] <= y[1] * M)
model += (x[3] <= y[3] * M)
model += (y[1] + y[3] <= 1)

# Alternatively, you can add problems like this:
# Zip will make them tuples, so (x1, 20), (x2, 12), etc.
# and then we multiply them and finally sum them up via lpsum.
obj_func = lpSum([a[0] * a[1] for a in zip(x.values(), [20, 12, 40, 25])])
model += obj_func

start = timer()
# solver is optional. Can also solve it like this:
status = model.solve()
# status = model.solve(solver=GLPK(msg=False))
end = timer()
print(f"status: {model.status}, {LpStatus[model.status]}")
print(f"objective: {model.objective.value()}")
print(f"Elapsed time (ms): {(end - start) * 1000}")

for var in model.variables():
    print(f"{var.name}: {var.value()}")
