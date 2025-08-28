import { apd } from "#rokay/core"
import { size as sizeAttr } from "rokay/browser/attr"
import { canvas, div } from "rokay/browser/elt"
import { $ } from "rokay/browser/prop"
import { size, transform, transformOrigin } from "rokay/browser/style"
import { mix } from "rokay/mix"

import { World } from "../../shared/world/types.gen"
import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"


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
          drawer.bg()
          world.cats.forEach((cat) => {
            drawer.cat(cat)
          })
        }),
      )),
    )
  }
