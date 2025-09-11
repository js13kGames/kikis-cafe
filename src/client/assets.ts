import { tab } from "rokay/data/array"

import { TextCanvas } from "./elts/text-canvas"


export type Assets = {
  cat: HTMLImageElement
  font9: Map<string, HTMLCanvasElement>
  font12: Map<string, HTMLCanvasElement>
  font16: Map<string, HTMLCanvasElement>
  font16italic: Map<string, HTMLCanvasElement>
}


export const
  load = () =>
    Promise.all([
      loadImage("/art/cat.png"),
      loadFont("9px monospace"),
      loadFont("12px monospace", 4),
      loadFont("16px monospace", 6),
      loadFont("italic 16px monospace", 6),
    ])
      .then(([cat, font9, font12, font16, font16italic]): Assets => ({
        cat,
        font9,
        font12,
        font16,
        font16italic,
      }))


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
    )
