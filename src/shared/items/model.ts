import { divide, floor_, scale_, V } from "rokay/math/v"


export const
  TILE_SIZE = V(16, 16),
  TILE_CENTER = divide(TILE_SIZE, 2),

  keyToPos = (key: string) =>
    scale_(keyToTile(key), TILE_SIZE.x),

  keyToTile = (key: string) => {
    const match = key.match(/^(-?\d+),(-?\d+)$/)
    if (match == null) { throw new Error("Bad key: " + key) }
    return V(parseInt(match[1], 10), parseInt(match[2], 10))
  },

  posToKey = (pos: V) =>
    tileToKey(floor_(divide(pos, TILE_SIZE.x))),

  tileToKey = (tile: V) =>
    `${tile.x},${tile.y}`
