import { AppClient } from "./app"
import { Assets } from "./assets"
import { StateOutsideFM, WorldFM } from "./worlds/form-models.gen"
import { WorldCanvas } from "./worlds/world-canvas"


export const
  IndexPage = (appClient: AppClient, assets: Assets, state: StateOutsideFM, world: WorldFM) =>
    WorldCanvas(appClient, assets, true, world.cats, world.itemsOutside, state.state, world)
