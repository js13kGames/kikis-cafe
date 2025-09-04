import { TextCanvas } from "elts/text-canvas"
import { withCtx } from "rokay/browser/game/danvas"
import { getOrPut } from "rokay/data/map"

import { Cat } from "../shared/cats/types.gen"

import { Assets } from "./assets"
import { CatCanvas } from "./cats/cat-canvas"


export type Drawer = {
  bg(): void
  bgInside(): void
  bgStore(): void
  bgWork(): void
  cat(cat: Cat): void
  clear(): void
  text(text: string): void
}


export const
  withDrawer = (assets: Assets, cb: (drawer: Drawer) => void) => withCtx((ctx) => {
    const
      catCanvases = new Map<Cat, HTMLCanvasElement>(),
      letterCanvases = new Map<string, HTMLCanvasElement>()

    cb({
      bg() {
        const SKY_HEIGHT_PX = 48
        ctx.fillStyle = "hsl(232, 70%, 56%)"
        ctx.fillRect(0, 0, ctx.canvas.width, SKY_HEIGHT_PX)
        ctx.fillStyle = "hsl(120, 70%, 60%)"
        ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, ctx.canvas.height - SKY_HEIGHT_PX)
      },

      bgInside() {
        const SKY_HEIGHT_PX = 48
        ctx.fillStyle = "hsl(32, 70%, 76%)"
        ctx.fillRect(0, 0, ctx.canvas.width, SKY_HEIGHT_PX)
        ctx.fillStyle = "hsl(100, 70%, 41%)"
        ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, ctx.canvas.height - SKY_HEIGHT_PX)
      },

      bgStore() {
        const SKY_HEIGHT_PX = 48
        ctx.fillStyle = "hsl(232, 70%, 56%)"
        ctx.fillRect(0, 0, ctx.canvas.width, SKY_HEIGHT_PX)
        ctx.fillStyle = "hsl(120, 70%, 60%)"
        ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, ctx.canvas.height - SKY_HEIGHT_PX)
      },

      bgWork() {
        const SKY_HEIGHT_PX = Math.floor(ctx.canvas.height / 2)
        ctx.fillStyle = "hsl(30, 30%, 90%)"
        ctx.fillRect(0, 0, ctx.canvas.width, SKY_HEIGHT_PX)
        ctx.fillStyle = "hsl(30, 30%, 30%)"
        ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, ctx.canvas.height - SKY_HEIGHT_PX)
      },

      cat(cat) {
        const canvas = getOrPut(catCanvases, cat, () => CatCanvas(cat, assets.cat))
        ctx.save()
        ctx.translate(cat.pos.x, cat.pos.y)
        ctx.scale(cat.scale.x, cat.scale.y)
        // ctx.fillStyle = "rgba(0,0,0,.5)"
        // ctx.fillRect(-5, -2, 10, 4)
        ctx.drawImage(canvas, 0, 0, 16, 16, -8, -13, 16, 16)
        ctx.restore()
      },

      clear() { ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) },

      text(text: string) {
        ctx.save()
        const letters = text.split("")
        letters.forEach((letter) => {
          const l = getOrPut(letterCanvases, letter, () => TextCanvas(letter))
          ctx.drawImage(l, 0, 0)
          ctx.translate(l.width, 0)
        })
        ctx.restore()
      },
    })
  })
