import { withCtx } from "rokay/browser/game/danvas"
import { getOrPut } from "rokay/data/map"

import { Cat } from "../shared/cats/types.gen"

import { Assets } from "./assets"
import { CatCanvas } from "./cats/cat-canvas"


export type Drawer = {
  bg(): void
  cat(cat: Cat): void
}


export const
  withDrawer = (assets: Assets, cb: (drawer: Drawer) => void) => withCtx((ctx) => {
    const canvases = new Map<Cat, HTMLCanvasElement>()

    cb({
      bg() {
        ctx.fillStyle = "hsl(120, 70%, 70%)"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      },

      cat(cat) {
        const canvas = getOrPut(canvases, cat, () => CatCanvas(cat, assets.cat))
        ctx.drawImage(canvas, 0, 0, 16, 16, 0, 0, 16, 16)
      },
    })
  })
