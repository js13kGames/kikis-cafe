import { StateOutside } from "../shared/world/types.gen"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { WorldFM } from "./world/form-models.gen"
import { WorldCanvas } from "./worlds/world-canvas"


export const
  IndexPage = (appClient: AppClient, assets: Assets, state: StateOutside, world: WorldFM) => {
    return WorldCanvas(appClient, assets, state, world)
  }
