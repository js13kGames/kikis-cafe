import { size } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { withCtx } from "rokay/browser/game/danvas"

import { Cat } from "../../shared/cats/types.gen"


export const
  CatCanvas = (_cat: Cat, img: HTMLImageElement) => canvas(
    size(img.width, img.height),
    withCtx((ctx) => {
      ctx.drawImage(img, 0, 0)
    }),
  )
