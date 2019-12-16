interface IPoint {
    x: number;
    y: number;
}

export const getSlope = (from: IPoint, to: IPoint) => {
    if (to.x - )
};

export const ans = (grid: string[][]) => {
    const asteriods: IPoint[] = [];
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[i].length; j++)
            if (grid[i][j] === '#')
                asteriods.push({x: j, y: i});

    for (let i = 0; i < asteriods.length; i++) {
        const visited = new Set<string>();
        for (let j = 0; j < asteriods.length; j++) {
            if (j === i || visited.has(`${j},${i}`))
                continue;
            visited.add(`${j},${i}`);

        }
    }
};
