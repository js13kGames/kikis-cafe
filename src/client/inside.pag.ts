import { AppClient } from "./app"
import { Assets } from "./assets"
import { StateInsideFM, WorldFM } from "./worlds/form-models.gen"
import { WorldCanvas } from "./worlds/world-canvas"


export const
  InsidePage = (app: AppClient, assets: Assets, state: StateInsideFM, world: WorldFM) =>
    WorldCanvas(app, assets, false, world.catsInside, world.itemsInside, state.state, world)
