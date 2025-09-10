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
      loadFont("12px monospace"),
      loadFont("16px monospace"),
      loadFont("italic 16px monospace"),
    ])
      .then(([cat, font9, font12, font16, font16italic]): Assets => ({
        cat,
        font9,
        font12,
        font16,
        font16italic,
      }))


const
  loadFont = (font: string, fill = "#fff") =>
    new Promise<Map<string, HTMLCanvasElement>>(
      (res) => {
        res(
          new Map<string, HTMLCanvasElement>(
            tab(0x7f - 0x21, (i) => String.fromCharCode(0x21 + i)).map((letter) =>
              [letter, TextCanvas(letter, { fill, font })]
            ),
          ),
        )
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
