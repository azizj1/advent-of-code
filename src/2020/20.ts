import { assert } from '~/util/assert';
import { timer } from '~/util/Timer';
import { declareProblem, getRunsFromIniNewlineSep, pipe } from '~/util/util';
import { reverse, Tile } from './20-tile';
import input from './20.txt';

export interface Sim {
  name: string;
  tiles: Tile[];
}

export type Borders = { borderToTiles: Map<string, Tile[]> };
export type Corners = { corners: [Tile, Tile, Tile, Tile] };

export function getSimulations(): Sim[] {
  return getRunsFromIniNewlineSep(input).map((sim) => {
    const tiles: Tile[] = [];
    let tileId: number | undefined = undefined;
    let grid: string[] = [];
    for (const line of sim.content) {
      if (line.indexOf('Tile') === 0) {
        if (grid.length > 0) {
          tiles.push(new Tile(assert(tileId), [...grid]));
        }
        grid = [];
        tileId = assert(Number(line.match(/\d+/)?.[0]), (n) => !isNaN(n));
      } else if (line[0] === '.' || line[0] === '#') {
        grid.push(line);
      }
    }
    tiles.push(new Tile(assert(tileId), [...grid]));
    return {
      name: sim.name,
      tiles,
    };
  });
}

export function addBorderToTilesMapToSim(sim: Sim): Sim & Borders {
  const { tiles } = sim;
  // border -> Tile[]
  const borderToTiles = new Map<string, Tile[]>();
  for (const tile of tiles) {
    for (const border of tile.borders) {
      const reversed = reverse(border);
      if (!borderToTiles.has(border)) {
        borderToTiles.set(border, []);
      }
      if (!borderToTiles.has(reversed)) {
        borderToTiles.set(reversed, []);
      }
      borderToTiles.get(border)!.push(tile);
      borderToTiles.get(reversed)!.push(tile);
    }
  }
  return { ...sim, borderToTiles };
}

export function addCornerTilesToSim(
  sim: Sim & Borders
): Sim & Borders & Corners {
  const { tiles, borderToTiles } = sim;
  const corners: Tile[] = [];
  for (const tile of tiles) {
    let uniqueBorders = 0;
    for (const border of tile.borders) {
      const borderToTileCount = borderToTiles.get(border)!.length;
      if (borderToTileCount === 1) {
        uniqueBorders++;
      }
    }
    assert(
      uniqueBorders <= 2,
      `All tiles must have no more than two uniqueBorders. Tile ID ${tile.id} has ${uniqueBorders} unique borders.`
    );

    if (uniqueBorders === 2) {
      corners.push(tile);
    }
  }
  return {
    ...sim,
    corners: assert(corners as [Tile, Tile, Tile, Tile], corners.length === 4),
  };
}

function multiply({ corners }: Corners) {
  return corners.map((c) => c.id).reduce((agg, curr) => curr * agg);
}

export function run() {
  declareProblem('day 20');
  const sim = getSimulations()[0];
  timer.run(
    pipe(addBorderToTilesMapToSim, addCornerTilesToSim, multiply),
    `day 20 - ${sim.name}`,
    sim
  );
}
