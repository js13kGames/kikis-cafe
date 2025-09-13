import { size as sizeAttr } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { withCtx } from "rokay/browser/game/danvas"
import { getOrPut } from "rokay/data/map"
import { pick } from "rokay/math/random"
import { divide, V, VZ } from "rokay/math/v"

import { Item } from "../shared/items/types.gen"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { CatCanvas } from "./cats/cat-canvas"
import { CatFM } from "./cats/form-models.gen"
import { TextCanvas } from "./elts/text-canvas"


export type Drawer = {
  ctx: CanvasRenderingContext2D
  bg(): void
  bgInside(): void
  bgStore(): void
  bgWork(): void
  cat(cat: CatFM): void
  clear(): void
  focus(cat: CatFM | undefined): void
  item(item: Item, at?: V): void
  text(text: string): void
  track(cb: () => void): void
}

export type Interp = {
  get(): number
  set(_target: number): void
  step(): void
}


const
  BASE_BOARD_COLOR = "hsl(34, 68%, 32%)",
  CARPET_COLOR = "hsl(245, 23%, 31%)",
  GRASS_COLOR = "hsl(120, 70%, 60%)"


export const
  outlineBox = (x: number, y: number, w: number, h: number, strokeWidth = 1) =>
    (ctx: CanvasRenderingContext2D) => {
      ctx.lineWidth = strokeWidth
      ctx.fillRect(x + strokeWidth, y + strokeWidth, w - 2 * strokeWidth, h - 2 * strokeWidth)
      ctx.strokeRect(x + strokeWidth / 2, y + strokeWidth / 2, w - strokeWidth, h - strokeWidth)
    },

  withDrawer = (app: AppClient, assets: Assets, cb: (drawer: Drawer) => void) => withCtx((ctx) => {
    ctx.imageSmoothingEnabled = false

    const
      outlineBox = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        {
          fill = ctx.fillStyle,
          stroke = ctx.strokeStyle,
          strokeWidth = ctx.lineWidth,
        }: {
          fill?: CanvasRenderingContext2D["fillStyle"]
          stroke?: CanvasRenderingContext2D["strokeStyle"]
          strokeWidth?: number
        } = {},
      ) => {
        ctx.fillStyle = fill
        ctx.fillRect(x + strokeWidth, y + strokeWidth, w - 2 * strokeWidth, h - 2 * strokeWidth)
        ctx.strokeStyle = stroke
        ctx.lineWidth = strokeWidth
        ctx.strokeRect(x + strokeWidth, y + strokeWidth, w - strokeWidth, h - strokeWidth)
      },
      x = Interp(Math.floor(ctx.canvas.width / 2)),
      y = Interp(Math.floor(ctx.canvas.height / 2)),
      zoom = Interp(1)

    let focus: CatFM | undefined

    const drawer: Drawer = {
      ctx,

      bg() {
        const { size } = app.size.get()
        const bg = getOrPut(assets.cached.bgs, `outside@${size.x},${size.y}`, () => canvas(
          sizeAttr(size.x, size.y),
          withCtx((ctx) => {
            const SKY_HEIGHT_PX = 48
            // brick wall
            for (let i = 0; i < SKY_HEIGHT_PX; i += 3) {
              for (let x = i % 2 ? -3 : 0; x < ctx.canvas.width; x += 6) {
                outlineBox(ctx, x, i, 7, 4, {
                  fill: pick([`hsl(12, 70%, ${pick(["41%", "46%", "51%", "56%"])})`]),
                  stroke: "#fff",
                })
              }
            }

            // door
            ctx.save()
            ctx.fillStyle = "#999"
            ctx.translate(Math.floor(ctx.canvas.width / 2), SKY_HEIGHT_PX)
            const DOOR_SIZE = SKY_HEIGHT_PX * 3 / 4
            outlineBox(ctx, -DOOR_SIZE / 2, -DOOR_SIZE, DOOR_SIZE / 2, DOOR_SIZE, {
              fill: CARPET_COLOR,
              stroke: "hsl(0, 0%, 80%)",
            })
            outlineBox(ctx, 0, -DOOR_SIZE, DOOR_SIZE / 2, DOOR_SIZE, {
              fill: CARPET_COLOR,
              stroke: "hsl(0, 0%, 90%)",
            })
            ctx.restore()

            // grass
            ctx.fillStyle = GRASS_COLOR
            ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, ctx.canvas.height - SKY_HEIGHT_PX)

            // grass pattern
            ctx.fillStyle = "rgba(0,0,0,.25)"
            for (let y = SKY_HEIGHT_PX + 1; y < ctx.canvas.height; y += 1) {
              for (let x = y % 16 - 16; x < ctx.canvas.width; x += 16) {
                ctx.fillRect(x, y, 8, 1)
              }
            }

            // line at base of wall
            ctx.fillStyle = "#000"
            ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, 1)
          }),
        ))
        ctx.drawImage(bg, 0, 0)
      },

      bgInside() {
        const { size } = app.size.get()
        const bg = getOrPut(assets.cached.bgs, `inside@${size.x},${size.y}`, () => canvas(
          sizeAttr(size.x, size.y),
          withCtx((ctx) => {
            const SKY_HEIGHT_PX = 48
            // wall
            ctx.fillStyle = "hsl(32, 70%, 76%)"
            ctx.fillRect(0, 0, ctx.canvas.width, SKY_HEIGHT_PX)
            ctx.fillStyle = "rgba(0,0,0,.25)"
            for (let x = 0; x < ctx.canvas.width; x += 8) {
              ctx.fillRect(x, 0, 4, SKY_HEIGHT_PX)
            }

            // baseboard
            ctx.fillStyle = BASE_BOARD_COLOR
            ctx.fillRect(0, SKY_HEIGHT_PX - 3, ctx.canvas.width, 3)

            // door
            ctx.save()
            ctx.translate(Math.floor(ctx.canvas.width / 2), SKY_HEIGHT_PX)
            const DOOR_SIZE = SKY_HEIGHT_PX * 3 / 4
            ctx.strokeStyle = "hsl(34,68%,26%)"
            ctx.lineWidth = 2
            ctx.strokeRect(-DOOR_SIZE / 2 - .5, -DOOR_SIZE - .5, DOOR_SIZE + 2, DOOR_SIZE + 2)
            ctx.lineWidth = 1
            outlineBox(ctx, -DOOR_SIZE / 2, -DOOR_SIZE, DOOR_SIZE / 2, DOOR_SIZE, {
              fill: GRASS_COLOR,
              stroke: "hsl(0, 0%, 80%)",
            })
            outlineBox(ctx, 0, -DOOR_SIZE, DOOR_SIZE / 2, DOOR_SIZE, {
              fill: GRASS_COLOR,
              stroke: "hsl(0, 0%, 90%)",
            })
            ctx.restore()

            // carpet
            ctx.fillStyle = CARPET_COLOR
            ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, ctx.canvas.height - SKY_HEIGHT_PX)
            ctx.fillStyle = "rgba(0,0,0,.25)"
            for (let y = SKY_HEIGHT_PX + 1; y < ctx.canvas.height; y += 8) {
              for (let x = 0; x < ctx.canvas.width; x += 8) {
                ctx.fillRect(x, y, 6, 6)
              }
            }

            // seperator
            ctx.fillStyle = "#000"
            ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, 1)
          }),
        ))
        ctx.drawImage(bg, 0, 0)
      },

      bgStore() {
        const { size } = app.size.get()
        const bg = getOrPut(assets.cached.bgs, `store@${size.x},${size.y}`, () => canvas(
          sizeAttr(size.x, size.y),
          withCtx((ctx) => {
            ctx.fillStyle = "hsl(3, 26%, 30%)"
            ctx.fillRect(0, 0, size.x, size.y)
          }),
        ))
        ctx.drawImage(bg, 0, 0)
      },

      bgWork() {
        const { size } = app.size.get()
        const bg = getOrPut(assets.cached.bgs, `work@${size.x},${size.y}`, () => canvas(
          sizeAttr(size.x, size.y),
          withCtx((ctx) => {
            const SKY_HEIGHT_PX = Math.floor(ctx.canvas.height / 2)
            // wall
            ctx.fillStyle = "hsl(56, 9%, 58%)"
            ctx.fillRect(0, 0, ctx.canvas.width, SKY_HEIGHT_PX)

            // desk
            ctx.fillStyle = "hsl(30, 10%, 30%)"
            ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, ctx.canvas.height - SKY_HEIGHT_PX)
            ctx.fillStyle = "rgba(0, 0, 0, .25)"
            for (let y = SKY_HEIGHT_PX + 2; y < ctx.canvas.height; y += 2) {
              ctx.fillRect(0, y, ctx.canvas.width, 1)
            }

            // seperator line
            ctx.fillStyle = "#000"
            ctx.fillRect(0, SKY_HEIGHT_PX, ctx.canvas.width, 1)

            // keyboard
            ctx.drawImage(
              assets.keyboard,
              Math.round(ctx.canvas.width / 2) - assets.keyboard.width,
              SKY_HEIGHT_PX + 5,
            )

            // monitor
            ctx.drawImage(
              assets.monitor,
              Math.round(ctx.canvas.width / 2) - assets.monitor.width / 2 + 30,
              SKY_HEIGHT_PX - assets.monitor.height + 45,
            )
          }),
        ))
        ctx.drawImage(bg, 0, 0)
      },

      cat(cat) {
        const _state = cat.state.get()
        if (_state.t === "suspend") { return }
        const canvas = getOrPut(assets.cached.cats, cat, () => CatCanvas(cat, assets.cat))
        ctx.save()
        ctx.translate(cat.pos.x, cat.pos.y)
        ctx.scale(cat.scale.x, cat.scale.y)
        const frame = _state.t === "dead" ?
            V(2, 1)
          :
            V(
              _state.t === "eat" || _state.t === "drink" ?
                3
              : _state.t === "sit" ?
                1
              :
                0,
              cat.blink ? 1 : 0,
            )
        ctx.drawImage(canvas, frame.x * 16, frame.y * 16, 16, 16, -8, -13, 16, 16)
        ctx.restore()
      },

      clear() { ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) },

      focus(cat) {
        if (focus = cat) {
          x.set(cat.pos.x)
          y.set(cat.pos.y)
          zoom.set(5)
        } else {
          x.set(Math.floor(ctx.canvas.width / 2))
          y.set(Math.floor(ctx.canvas.height / 2))
          zoom.set(1)
        }
      },

      item(item, at = VZ) {
        ctx.drawImage(
          assets.items,
          (
            item.t === "waterBowl" ?
              0
            : item.t === "food" ?
              1
            :
              2
          ) * 16,
          0,
          16,
          16,
          at.x,
          at.y,
          16,
          16,
        )
      },

      text(text: string, font: "font9" | "font12" | "font16" | "font16italic" = "font9") {
        ctx.save()
        const letters = text.split("")
        letters.forEach((letter) => {
          const l = getOrPut(assets[font], letter, () => TextCanvas(letter))
          ctx.drawImage(l, 0, 0)
          ctx.translate(l.width, 0)
        })
        ctx.restore()
      },

      track(cb: () => void) {
        ctx.save()
        if (focus) {
          x.set(focus.pos.x)
          y.set(focus.pos.y)
        }
        x.step()
        y.step()
        zoom.step()
        ctx.translate(Math.floor(ctx.canvas.width / 2), Math.floor(ctx.canvas.height / 2))
        const z = zoom.get()
        ctx.scale(z, z)
        const { bounds } = app.size.get()
        const size = V(ctx.canvas.width, ctx.canvas.height)
        const zoomedSize = divide(size, z)
        const diff = divide(zoomedSize, 2)
        ctx.translate(
          -Math.round(Math.max(bounds.min.x + diff.x, Math.min(x.get(), bounds.max.x - diff.x))),
          -Math.round(Math.min(y.get(), bounds.max.y - diff.y)),
        )
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
