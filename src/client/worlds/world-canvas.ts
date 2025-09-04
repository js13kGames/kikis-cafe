import { onDestroy } from "#rokay/capture"
import { size as sizeAttr } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { onMousedown } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { divide_, floor_, V } from "rokay/math/v"

import { StateOutside } from "../../shared/world/types.gen"
import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"
import { WorldFM } from "../world/form-models.gen"


export const
  WorldCanvas = (app: AppClient, assets: Assets, state: StateOutside, world: WorldFM) => canvas(
    $(app.size, ({ size: { x, y } }) => sizeAttr(x, y)),
    withDrawer(assets, (drawer) => {
      const loop = Loop(() => {
        drawer.track(() => {
          drawer.bg()
          world.cats.forEach((cat) => {
            drawer.cat(cat)
          })
        })
      })
        .start()

      onDestroy(() => {
        loop.destroy()
      })

      onDestroy(onMousedown<HTMLCanvasElement>((el, _ev) => {
        if (state.focus != null) { return }
        const rect = el.getBoundingClientRect()
        const pos = floor_(divide_(
          V(_ev.clientX - rect.x, _ev.clientY - rect.y),
          app.size.get().zoom,
        ))

        const cat = world.cats.find((cat) =>
          cat.pos.x - 6 < pos.x
          && pos.x < cat.pos.x + 6
          && cat.pos.y - 12 < pos.y
          && pos.y < cat.pos.y + 2
        )
        console.log("cat:", cat)
        drawer.focus(cat)
      })(drawer.ctx.canvas))
    }),
  )
