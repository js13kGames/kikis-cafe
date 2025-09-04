import { onDestroy } from "#rokay/capture"
import { size as sizeAttr } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { $ } from "rokay/browser/prop"

import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"
import { WorldFM } from "../world/form-models.gen"


export const
  WorldCanvas = (app: AppClient, assets: Assets, world: WorldFM) => canvas(
    $(app.size, ({ size: { x, y } }) => sizeAttr(x, y)),
    withDrawer(assets, (drawer) => {
      const loop = Loop(() => {
        drawer.bg()
        world.cats.forEach((cat) => {
          drawer.cat(cat)
        })
      })
        .start()

      onDestroy(() => {
        loop.destroy()
      })
    }),
  )
