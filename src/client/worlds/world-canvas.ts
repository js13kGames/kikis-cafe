import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { size as sizeAttr } from "rokay/browser/attr"
import { canvas, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { $ } from "rokay/browser/prop"
import { size, transform, transformOrigin } from "rokay/browser/style"
import { int } from "rokay/math/random"
import { V } from "rokay/math/v"
import { mix } from "rokay/mix"

import { RandomCat } from "../../shared/cats/model"
import { World } from "../../shared/world/types.gen"
import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"
import { CAT_RATE } from "../rates"


export const
  WorldWrapper = (app: AppClient, assets: Assets, world: World) => {
    return div(
      $(app.size, ({ size: { x, y }, zoom }) => mix(
        size(x + "px", y + "px"),
        transform(`scale(${zoom})`),
      )),
      transformOrigin("top left"),
      apd(canvas(
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
              if (Math.random() < CAT_RATE) {
                world.cats.push(RandomCat(
                  V(int(0, app.size.get().size.x), int(0, app.size.get().size.y)),
                ))
              }
            },
            loop = Loop(() => {
              step()
              draw()
            })
              .start()

          onDestroy(() => {
            loop.destroy()
          })
        }),
      )),
    )
  }
