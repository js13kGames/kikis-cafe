import { size } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { fills, image, outline, shrink, solidify, text as canText, withCtx } from "rokay/browser/game/danvas"
import { getOrPut } from "rokay/data/map"
import { V } from "rokay/math/v"


export const
  TextCanvas = (
    text: string,
    {
      fill = "#fff",
      font = "9px monospace",
      height = 16,
    }: {
      fill?: string
      font?: string
      height?: number
    } = {},
  ) => {
    const txt = canvas(size(512, height), withCtx(
      fills(fill),
      (ctx) => {
        ctx.font = font
      },
      canText(text, 0, Math.floor(height * 3 / 4)),
      solidify(80),
      shrink({ max: V(-Infinity, height), min: V(Infinity, 0) }),
    ))

    return canvas(size(txt.width + 2, txt.height + 2), withCtx(
      txt.width || txt.height ?
        image(txt, 0, 0, txt.width, txt.height, 1, 1, txt.width, txt.height)
      :
        () => {},
      fills("#000"),
      outline(1),
    ))
  },

  TextCanvas2 = (text: string, font: Map<string, HTMLCanvasElement>) => {
    const can = canvas(size(512, 32), withCtx(
      (ctx) => {
        ctx.save()
        const letters = text.split("")
        letters.forEach((letter) => {
          const l = getOrPut(font, letter, () => TextCanvas(letter))
          ctx.drawImage(l, 0, 0)
          ctx.translate(l.width - 1, 0)
        })
        ctx.restore()
      },
      shrink(),
    ))
    return can
  }
