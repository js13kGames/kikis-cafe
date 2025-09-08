import { size } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { fills, image, outline, shrink, solidify, text as canText, withCtx } from "rokay/browser/game/danvas"


export const
  TextCanvas = (
    text: string,
    { fill = "#fff", font = "9px monospace" }: { fill?: string, font?: string } = {},
  ) => {
    const txt = canvas(size(512, 32), withCtx(
      fills(fill),
      (ctx) => {
        ctx.font = font
      },
      canText(text, 0, 24),
      solidify(80),
      shrink,
    ))

    return canvas(size(txt.width + 2, txt.height + 2), withCtx(
      txt.width || txt.height ?
        image(txt, 0, 0, txt.width, txt.height, 1, 1, txt.width, txt.height)
      :
        () => {},
      fills("#000"),
      outline(1),
    ))
  }
