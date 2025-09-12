import { CatFM } from "cats/form-models.gen"
import { outlineBox } from "drawer"
import { size } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { fills, outline, rect, withCtx } from "rokay/browser/game/danvas"
import { tab } from "rokay/data/array"
import { V } from "rokay/math/v"

import { TextCanvas } from "./elts/text-canvas"


export type Assets = {
  cached: { bgs: Map<string, HTMLCanvasElement>, cats: Map<CatFM, HTMLCanvasElement> }
  cat: HTMLImageElement
  font9: Map<string, HTMLCanvasElement>
  font12: Map<string, HTMLCanvasElement>
  font16: Map<string, HTMLCanvasElement>
  font16italic: Map<string, HTMLCanvasElement>
  items: HTMLImageElement
  keyboard: HTMLCanvasElement
  monitor: HTMLCanvasElement
  person: HTMLCanvasElement
}


export const
  load = () =>
    Promise.all([
      loadImage("/art/cat.png"),
      loadImage("/art/items.png"),
      loadFont("9px monospace"),
      loadFont("12px monospace", 4),
      loadFont("16px monospace", 6),
      loadFont("italic 16px monospace", 6),
      renderKeyboard(),
      renderMonitor(),
      renderPerson(),
    ])
      .then(
        ([cat, items, font9, font12, font16, font16italic, keyboard, monitor, person]): Assets => ({
          cached: {
            bgs: new Map<string, HTMLCanvasElement>(),
            cats: new Map<CatFM, HTMLCanvasElement>(),
          },
          cat,
          font9,
          font12,
          font16,
          font16italic,
          items,
          keyboard,
          monitor,
          person,
        }),
      )


const
  loadFont = (font: string, minWidth = 3, fill = "#fff") =>
    new Promise<Map<string, HTMLCanvasElement>>(
      (res) => {
        res(new Map<string, HTMLCanvasElement>(
          tab(0x7f - 0x20, (i) => String.fromCharCode(0x20 + i)).map((letter) => [
            letter,
            TextCanvas(letter, {
              fill,
              font,
              minWidth,
            }),
          ]),
        ))
      },
    ),

  loadImage = (src: string) =>
    new Promise<HTMLImageElement>(
      (res, rej) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
          res(img)
        }
        img.onerror = (e) => {
          rej(e)
        }
      },
    ),

  KEYBOARD_SIZE = V(59, 19),
  KEY_SIZE = V(5, 5),
  renderKeyboard = () =>
    new Promise<HTMLCanvasElement>(
      (res) => res(canvas(size(KEYBOARD_SIZE.x + 2, KEYBOARD_SIZE.y + 2), withCtx(
        fills("#333"),
        rect(1, 1, KEYBOARD_SIZE.x, KEYBOARD_SIZE.y),
        (ctx) => {
          ctx.fillStyle = "#444"
          ctx.strokeStyle = "#111"
          for (let y = 2; y < KEYBOARD_SIZE.y - KEY_SIZE.y + 1; y += KEY_SIZE.y - 1) {
            for (let x = 2; x < KEYBOARD_SIZE.x - KEY_SIZE.x + 1; x += KEY_SIZE.x - 1) {
              outlineBox(x, y, KEY_SIZE.x, KEY_SIZE.y)(ctx)
            }
          }
        },
        fills("#000"),
        outline(1),
      ))),
    ),

  BASE_SIZE = V(40, 20),
  MONITOR_OFFSET = V(0, -30),
  MONITOR_SIZE = V(84, 52),
  NECK_SIZE = V(20, 50),
  FULL_SIZE = V(MONITOR_SIZE.x + 2, MONITOR_SIZE.y - MONITOR_OFFSET.y + 2),
  BASE_COLOR = "#222",
  renderMonitor = () =>
    new Promise<HTMLCanvasElement>(
      (res) => res(canvas(size(FULL_SIZE.x, FULL_SIZE.y), withCtx(
        (ctx) => {
          ctx.save()
          ctx.translate(Math.round(ctx.canvas.width / 2), ctx.canvas.height - 1)
          ctx.fillStyle = BASE_COLOR
          ctx.fillRect(-BASE_SIZE.x / 2, -BASE_SIZE.y, BASE_SIZE.x, BASE_SIZE.y)
          ctx.fillRect(
            -MONITOR_SIZE.x / 2,
            -MONITOR_SIZE.y + MONITOR_OFFSET.y,
            MONITOR_SIZE.x,
            MONITOR_SIZE.y,
          )
          ctx.fillStyle = "#333"
          ctx.fillRect(
            -MONITOR_SIZE.x / 4,
            -MONITOR_SIZE.y / 4 - NECK_SIZE.y,
            MONITOR_SIZE.x / 2,
            MONITOR_SIZE.y / 2,
          )
          ctx.fillStyle = "#444"
          ctx.fillRect(-NECK_SIZE.x / 2, -NECK_SIZE.y, NECK_SIZE.x, NECK_SIZE.y - 5)
          ctx.restore()
        },
        fills("#000"),
        outline(1),
      ))),
    ),

  renderPerson = () =>
    new Promise<HTMLCanvasElement>((res) => res(canvas(size(FULL_SIZE.x, FULL_SIZE.y), withCtx())))
