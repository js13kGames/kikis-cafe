import { Asink } from "rokay/prop/async"

import { World } from "../shared/world/types.gen"

import { AppClient } from "./app"
import { load } from "./assets"
import { Loader } from "./elts/loader"
import { WorldWrapper } from "./worlds/world-canvas"


export const
  IndexPage = (appClient: AppClient, world: World) => {
    const assets = Asink({
      gen: () => load(),
    })

    return Loader(assets, (assets) => WorldWrapper(appClient, assets, world))
  }
