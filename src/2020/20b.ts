import { assert } from '~/util/assert';
import { mod } from '~/util/math';
import { Queue } from '~/util/Queue';
import { timer } from '~/util/Timer';
import { declareProblem, pipe } from '~/util/util';
import {
  Sim,
  getSimulations,
  Borders,
  Corners,
  addCornerTilesToSim,
  addBorderToTilesMapToSim,
} from './20';
import { Side, Tile } from './20-tile';

const sideToVector: Map<Side, [number, number]> = new Map([
  [Side.Top, [0, -1]],
  [Side.Right, [1, 0]],
  [Side.Down, [0, 1]],
  [Side.Left, [-1, 0]],
]);

function assembleTiles({
  tiles,
  borderToTiles,
  corners,
}: Sim & Borders & Corners): Tile[][] {
  // The image must be a square.
  const size = assert(Math.sqrt(tiles.length), (n) => Number.isInteger(n));
  const image: Tile[][] = Array.from({ length: size }, () => []);
  // location is [x, y]
  const queue = new Queue<{ tile: Tile; location: [number, number] }>();
  const visited = new Set<number>(); // tileId.
  const topLeft = corners[0];

  visited.add(topLeft.id);
  rotateUntilTopLeftCorner(borderToTiles, topLeft);
  queue.enqueue({ tile: topLeft, location: [0, 0] });

  while (!queue.isEmpty()) {
    const {
      tile,
      location: [x, y],
    } = queue.dequeue()!;
    image[y][x] = tile;
    for (const [border, side] of tile.bordersLocation) {
      const neighbor = borderToTiles
        .get(border)!
        .filter((b) => b.id !== tile.id)[0];

      if (neighbor && !visited.has(neighbor.id)) {
        neighbor.alignToTile(tile);
        visited.add(neighbor.id);
        const [dx, dy] = sideToVector.get(side)!;
        queue.enqueue({ tile: neighbor, location: [x + dx, y + dy] });
      }
    }
  }
  return image;
}

function rotateUntilTopLeftCorner(
  borderToTiles: Map<string, Tile[]>,
  corner: Tile
) {
  let leadingUniqueSide = 1;
  // Since it's a corner, the two unique edges will be adjacent. We want the
  // "leading" unique edge to be on top, and the one right behind it to be on
  // the left.
  for (const [border, side] of corner.bordersLocation.entries()) {
    // We want 0 (top) to be largest, 3 to be the next largest, 2 after, and then 1.
    // Subtracting 1 from the side gives us -1%4, 0%4, 1%4, 2%4. -1%4 = 3, which
    // is the highest now.
    if (
      borderToTiles.get(border)!.length === 1 &&
      mod(side - 1, 4) > mod(leadingUniqueSide - 1, 4)
    ) {
      leadingUniqueSide = side;
    }
  }

  while (mod(4 - leadingUniqueSide, 4) !== 0) {
    corner.rotate90DegreesCW();
    leadingUniqueSide++;
  }
}

function removeBordersFromAllTiles(image: Tile[][]): Tile[][] {
  const newImage: Tile[][] = [];
  for (const rowOfTiles of image) {
    const newRowOfTiles: Tile[] = [];
    for (const tile of rowOfTiles) {
      newRowOfTiles.push(removeBordersFromTile(tile));
    }
    newImage.push(newRowOfTiles);
  }
  return newImage;
}

function removeBordersFromTile(tile: Tile): Tile {
  const tileGrid = tile
    .to2DArray()
    .slice(1, -1)
    .map((row) => row.slice(1, -1).join(''));
  return new Tile(tile.id, tileGrid);
}

function combineToImage(tiles: Tile[][]): string[][] {
  const size = assert(tiles[0][0].size);
  const image: string[][] = [];

  for (const rowOfTiles of tiles) {
    const newRows: string[][] = Array.from({ length: size }, () => []);

    for (const tile of rowOfTiles) {
      const grid = tile.to2DArray();
      for (let i = 0; i < grid.length; i++) {
        newRows[i].push(...grid[i]);
      }
    }

    for (const row of newRows) {
      image.push(row);
    }
  }

  return image;
}

function toTile(image: string[][]): Tile {
  return new Tile(
    1,
    image.map((r) => r.join(''))
  );
}

function seaMonsterCount(tile: Tile): number {
  return tile.size;
}

export function run() {
  declareProblem('day 20b');
  const sim = getSimulations()[1];
  timer.run(
    pipe(
      addBorderToTilesMapToSim,
      addCornerTilesToSim,
      assembleTiles,
      removeBordersFromAllTiles,
      combineToImage,
      toTile,
      seaMonsterCount
    ),
    `day 20b - ${sim.name}`,
    sim
  );
}
