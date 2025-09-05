import { size } from "rokay/browser/attr"
import { canvas } from "rokay/browser/elt"
import { fills, outline, withCtx } from "rokay/browser/game/danvas"

import { DARK_CAT_COATS } from "../../shared/cats/model"

import { CatFM } from "./form-models.gen"


export const
  CatCanvas = (cat: CatFM, img: HTMLImageElement) => canvas(size(img.width, img.height), withCtx(
    (ctx) => {
      ctx.drawImage(img, 0, 0)
      const
        { data, width, height } = ctx.getImageData(0, 0, img.width, img.height),
        cmp = (x: number, y: number, r: number, g: number, b: number, a = 255) => {
          const i = 4 * (y * width + x)
          return data[i] === r && data[i + 1] === g && data[i + 2] === b && data[i + 3] === a
        }
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          if (cmp(x, y, 0, 0, 0)) {
            ctx.fillStyle = cat.coat
            ctx.fillRect(x, y, 1, 1)
          } else if (cmp(x, y, 255, 255, 0)) {
            ctx.fillStyle = cat.eyes
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    },
    fills(DARK_CAT_COATS.includes(cat.coat) ? "#fff" : "#000"),
    outline(2),
    outline(1),
  ))
