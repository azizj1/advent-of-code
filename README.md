# Advent of Code Solutions

My solutions to [Advent of Code](https://adventofcode.com/) problems.

## Quick Start

### NodeJS

1. Install dependencies via `yarn install`.
2. Two options:
   1. Run and watch a single file via `yarn watch-single`, or
   2. Run and watch the last file changed under a [specific year](src/watch-last-changed.ts) via `yarn start`.

### Python

1. Change directory `cd python`.
1. Install `virtualenv` via `pip3 install virtualenv`.
1. Run `virtualenv ./env`.
1. Run `source ./env/bin/activate`.
1. Run `pip install -r py-requirements.txt`.
1. Run `nodemon --exec python 2022/19.py`.

## 2022

1. [Day 7 - No Space Left On Device](src/2022/7.md)
   - Iterator pattern
1. [Day 11 - Monkey in the Middle](src/2022/11.md)
   - How to a keep a number small without impacting its divisibility by a
     specific number
   - LCM
1. [Day 12 - Hill Climbing Algorithm](src/2022/12.md)
   - Dijkstra's algorithm and tips on it
1. [Day 15 - Beacon Exclusion Zone](src/2022/15.md)
   - Merge intervals/ranges
   - Complement of intervals/ranges
1. [Day 16 - Proboscidea Volcanium](src/2022/16.md)
   - TODO
   - Floyd–Warshall algorithm
   - DFS with backtracking one option but not others
1. [Day 19 - Not Enough Minerals](src/2022/19.md)
   - Constraint satisfaction problem (CSP)
   - Python to solve the linear programming problem
   - Typescript for heuristic solution
1. [Day 21 - Monkey Math](src/2022/21.md)
   - TODO
   - Plot it out and use linear regression

## 2021

Not advent of code, but just a fun problem I found on MorningBrew:

1. [MorningBrew - Minimum plus/minus to get sum of 100](src/2021/morningbrew.md)

## 2020

Work in progress.

- [Day 4b - Rules Design Pattern](src/2020/4b.md)
- [Day 5a - Binary Everywhere](src/2020/5.md)
- [Day 6b - Custom Customs](src/2020/6.md)
  - Intersection of N arrays with unique values
- [Day 7 - Recursive Hand Bags](src/2020/7.md)
  - DFS on weighted graphs
- [Day 9b - Encoding Error](src/2020/9b.md)
  - Efficient continguous sum
  - 1D version of [Summed Area Tables](src/2018/11.md)
- [Day 10b - Adapter Array](src/2020/10b.md)
  - DP problem
  - Pigeonhole principle / counting
- [Day 11 - Seating System](src/2020/11.md)
  - Immutable object
  - 2D Convolution
- [Day 13 - Shuttle Search](src/2020/13b.md)
  - Fun with prime numbers.
- [Day 16 - Ticket Translation](src/2020/16.md)
  - Constraint satisfaction problem (CSP)
  - PriorityQueue to solve CSPs
- [Day 17 - Conway Cube](src/2020/17.md)
  - ArrayDeques
  - InfiniteGrid
  - `getPermutations` and `getSpace` backtracking solutions.
- [Day 18 - Math Expressions](src/2020/18.md)
  - Infix and postfix math expressions
- [Day 19 - Grammar](src/2020/19.md)
  - Rules design
  - Regex subroutines
  - CYK algorithm
- [Day 20 - Rotating Images](src/2020/20.md)
  - Rotation/reflection of 2D arrays in `O(1)`.
  - Finding sub-image inside image.
- [Day 21 - Allergen Assessment](src/2020/21.md)
  - Constraint satisfaction problem (CSP)
    - Uses Python to formulate and solve integer programming problem!
  - PriorityQueue to solve CSPs

## 2019

All problems are complete, but only some are worthy of notes:

- [Day 2b - System of Equations](src/2019/2b.md)
- [Day 12b - N-Body Problem](src/2019/12b.md)
  - Least Common Multiple (LCM)
- [Day 14 - Stoichiometry](src/2019/14.md)
  - Fun DFS traversal problem
  - Linear regression solution for part 2
- [Day 18a - Robots Unlocking Keys and Doors](src/2019/18.md)
  - Dijkstra's algorithm
- [Day 18b - Multiple Robots Unlocking Keys and Doors](src/2019/18b.md)
  - Combinatorics with Dijkstra.
- [Day 20a - Donut Maze](src/2019/20.md)
- [Day 20b - Recursive Donut Maze](src/2019/20b.md)
- [Day 22b - Slam Shuffle](src/2019/22.md)
  - Modular Inverse
  - Linear Congruence Equations
  - Modular Exponentiation
  - Fermats's Little Theorem
  - Extended Euclidian Algorithm
- [Day 24a - Bit manipulation](src/2019/24.md)
  - Why you can't assume first one will repeat first.
- [Day 24b - More bit manipulation](src/2019/24b.md)

## 2018

- [Day 2b - Find Similar Words](src/2018/2b.md)
  - Used the same idea as Word Ladder I.
- [Day 5 - Polymer Reactions](src/2018/5.md)
  - Good example of a Stack
- [Day 6 - Coordinate Proximity](src/2018/6.md)
  - First use of BFS in 2018.
- [Day 7 - The Sum of Its Parts](src/2018/7.md)
  - Lexicographical topological sort
  - Priority queue
- [Day 7b](src/2018/7b.md)
  - Coordinated lexicographical toplogical sort
- [Day 8 - Tree](src/2018/8.md)
  - N-ary Tree
  - Tree `toString()` explained
- [Day 8b - Tree](src/2018/8b.md)
  - N-ary Tree class
- [Day 10a - N-body Problem with Letters](src/2018/10.md)
  - Linearity of N-body problems
- [Day 11 - Summed Area Table](src/2018/11.md)
  - Summed Area Table
  - Largest divisor of a number
- [Day 12](src/2018/12.md)
  - Linear Regression
- [Day 13](src/2018/13.md)
  - Rotation and Reflection Matrices

# General problem solving tips

1. Try reducing the problem space down. If there's 10 valves, or 8 monkeys, or
   30 doors, etc. Imagine if there was just 1 or 2 valves or monkeys or doors.
   Solve that smaller problem space first.
2. Look at the input, make sure there isn't any shortcut you can take. Maybe
   some monkeys you'll never visit, or some doors that don't ever have to be
   opened, or some valves you don't have to release pressure on because flow is
   0, etc.
3. Transform the problem space. This came in handy for [2019 day
   18a](src/2019/18.md) and [2022 day 16](src/2022/16.md). Convert the problem
   into a graph, or an adjacency matrix, etc. that is much easier to work on
   because of fewer variables.
