import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { size } from "rokay/browser/attr"
import { canvas, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { $ } from "rokay/browser/prop"
import { bottom, display, justifyContent, position, width } from "rokay/browser/style"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { withDrawer } from "./drawer"
import { StateInsideFM, WorldFM } from "./worlds/form-models.gen"


export const
  InsidePage = (app: AppClient, assets: Assets, _state: StateInsideFM, world: WorldFM) => div(
    position("relative"),
    apd(
      canvas($(app.size, ({ size: { x, y} }) => size(x, y)), withDrawer(assets, (drawer) => {
        const loop = Loop(() => {
          drawer.bgInside()
          world.catsInside.get().forEach((cat) => {
            drawer.cat(cat)
          })
        })
          .start()

        onDestroy(() => {
          loop.destroy()
        })
      })),
      div(bottom("24px"), display("flex"), justifyContent("center"), position("absolute"), width(
        "100%",
      )),
    ),
  )
