import { onDestroy } from "#rokay/capture"
import { size as sizeAttr } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { $ } from "rokay/browser/prop"
import { int } from "rokay/math/random"
import { V } from "rokay/math/v"
import { Prop } from "rokay/prop/prop"

import { RandomCat } from "../../shared/cats/model"
import { World } from "../../shared/world/types.gen"
import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"
import { CAT_RATE } from "../rates"


export const
  WorldCanvas = (app: AppClient, assets: Assets, world: World) => canvas(
    $(app.size, ({ size: { x, y } }) => sizeAttr(x, y)),
    withDrawer(assets, (drawer) => {
      const
        draw = () => {
          drawer.bg()
          world.cats.forEach((cat) => {
            drawer.cat(cat)
          })
        },

        step = () => {
          ticks.set(ticks.get() - 1)
          if (Math.random() < CAT_RATE) {
            world.cats.push(RandomCat(
              V(int(0, app.size.get().size.x), int(0, app.size.get().size.y)),
            ))
          }
          world.cats.forEach((_cat) => {
            // cat step
          })
        },

        ticks = Prop(0),
        loop = Loop(() => {
          step()
          draw()
        })
          .start()

      onDestroy(() => {
        loop.destroy()
      })
    }),
  )
