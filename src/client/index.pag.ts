import { World } from "../shared/world/types.gen"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { WorldCanvas } from "./worlds/world-canvas"


export const
  IndexPage = (appClient: AppClient, assets: Assets, world: World) => {
    return WorldCanvas(appClient, assets, world)
  }
