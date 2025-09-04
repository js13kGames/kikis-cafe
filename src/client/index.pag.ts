import { AppClient } from "./app"
import { Assets } from "./assets"
import { WorldFM } from "./world/form-models.gen"
import { WorldCanvas } from "./worlds/world-canvas"


export const
  IndexPage = (appClient: AppClient, assets: Assets, world: WorldFM) => {
    return WorldCanvas(appClient, assets, world)
  }
