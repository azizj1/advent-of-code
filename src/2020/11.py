import numpy as np
from scipy.ndimage import convolve

with open("11py.txt") as f:
    rows = []
    for x in f:
        rows.append([c == "L" for c in x.strip()])

grid = np.array(rows).astype(np.int8)
originalGrid = grid.copy()
occ = (grid == 2).sum() # occupancy count
print("ORIGINAL GRID")
print(grid)
# kernel is equal to:
# 1 1 1
# 1 0 1
# 1 1 1
kernel = np.ones((3,3), dtype=np.int8)
kernel[1,1] = 0
# constant cval=0 means that at edges, make the weights 0. So at grid[0,0], the
# first row of the kernel and the first column of kernel are out of bounds, so
# they're weight are 0.
empty = convolve(originalGrid, kernel, mode="constant", cval=0)
print("EMPTY CONVOLUTION")
print(empty)

# Measurse how many neighbors each cell has. It does that by using the
# precomputed empty grid. This empty grid just tells us how many non-floor seats
# exist near each cell (since everything starts off as 'L', which is 1). And in grid, we'll
# have a "2" if it's occupied, meaning there's a neighbor next to us.
# In other words, if the grid returned from this (call it n) has n[x,y] = 4, it
# means it has 4 occupied seats near (x,y), because convolve(empty)[x,y] = 4, and
# convolve(grid)[x,y] = 8, and so subtracing 8-4 = 4. The reason empty returned
# 4 is because there are 4 non-floor seats next to it, and grid returned 8
# because there are 4 2s, where 2s represent occupied.
def get_neighbors(grid):
    return convolve(grid, kernel, mode="constant", cval=0) - empty

# 0 means floor
# 1 means vacant
# 2 means occupied
for idx in range(3): # Change this line to "while True:" to solve 11a.
    print("AT IDX " + str(idx))
    prev_occ = occ
    n = get_neighbors(grid)
    print("printing n")
    print(n)
    # if a cell has no neighbors (i.e., n[x,y] = 0), then set it to 1, because
    # it means it can become occupied. But if a cell has more than 4 neighbors,
    # set its value to -1 (n >= 4 will return true, and then the neg in front of
    # it turns it into -1). 1 - 1 will never happen because n can't equal 0 and
    # >=4 at the same time.
    u = (n == 0).astype(int) - (n >= 4).astype(int)
    print("printing delta (u)")
    print(u)
    # we want to keep the floor unchanged, so we set wherever
    # grid was to 0 (i.e., floor), to zero.
    u[grid == 0] = 0
    print("printing delta (u) again")
    print(u)
    # to each cell, we add either -1, 0 or 1.
    # -1 means it's no longer occupied, 0 means it's floor, and 1 means it's
    # occupied now. Remember each grid originally has values of either 0, 1 or
    # 2.
    grid = np.clip(grid + u, 0, 2)
    print("We added the delta (u) to grid")
    grid[grid == 0] = originalGrid[grid == 0]
    print("we updated everywhere grid was 0 to what originalGrid is equal to")
    print(grid)
    occ = (grid == 2).sum()
    if occ == prev_occ:
        break

print(occ)
