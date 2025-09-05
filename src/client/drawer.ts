import { TextCanvas } from "elts/text-canvas"
import { withCtx } from "rokay/browser/game/danvas"
import { getOrPut } from "rokay/data/map"

import { Assets } from "./assets"
import { CatCanvas } from "./cats/cat-canvas"
import { CatFM } from "./cats/form-models.gen"


export type Drawer = {
  ctx: CanvasRenderingContext2D
  bg(): void
  bgInside(): void
  bgStore(): void
  bgWork(): void
  cat(cat: CatFM): void
  clear(): void
  focus(cat: CatFM | undefined): void
  text(text: string): void
  track(cb: () => void): void
}

export type Interp = {
  get(): number
  set(_target: number): void
  step(): void
}


export const
  withDrawer = (assets: Assets, cb: (drawer: Drawer) => void) => withCtx((ctx) => {
    ctx.imageSmoothingEnabled = false

    const
      catCanvases = new Map<CatFM, HTMLCanvasElement>(),
      letterCanvases = new Map<string, HTMLCanvasElement>(
        ["$", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((letter) =>
          [letter, TextCanvas(letter)]
        ),
      ),
      x = Interp(Math.floor(ctx.canvas.width / 2)),
      y = Interp(Math.floor(ctx.canvas.height / 2)),
      zoom = Interp(1)

    const drawer: Drawer = {
      ctx,

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

      focus(cat) {
        if (cat) {
          x.set(cat.pos.x)
          y.set(cat.pos.y)
          zoom.set(5)
        } else {
          x.set(Math.floor(ctx.canvas.width / 2))
          y.set(Math.floor(ctx.canvas.height / 2))
          zoom.set(1)
        }
      },

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

      track(cb: () => void) {
        ctx.save()
        x.step()
        y.step()
        zoom.step()
        ctx.translate(Math.floor(ctx.canvas.width / 2), Math.floor(ctx.canvas.height / 2))
        ctx.scale(zoom.get(), zoom.get())
        ctx.translate(-Math.round(x.get()), -Math.round(y.get()))
        cb()
        ctx.restore()
      },
    }

    cb(drawer)
  }),

  Interp = (value: number) => {
    let target = value
    const i: Interp = {
      get() { return value },
      set(_target) { target = _target },
      step() { value = value + (target - value) / 20 },
    }
    return i
  }
