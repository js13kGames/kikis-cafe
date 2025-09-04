import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { size } from "rokay/browser/attr"
import { button, canvas, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { onClick } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { bottom, display, justifyContent, padding, position, top, width } from "rokay/browser/style"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { withDrawer } from "./drawer"
import { TextCanvas } from "./elts/text-canvas"
import { WorldFM } from "./world/form-models.gen"


export const
  WorkPage = (app: AppClient, assets: Assets, world: WorldFM) => div(
    position("relative"),
    apd(
      div(display("flex"), padding("8px"), position("absolute"), top("0px"), width("100%"), apd(
        canvas(size(100, 100), withDrawer(assets, (drawer) => {
          world.cash.listenAndCall((cash) => {
            drawer.clear()
            drawer.text(`$${cash}`)
          })
        })),
      )),
      canvas($(app.size, ({ size: { x, y} }) => size(x, y)), withDrawer(assets, (drawer) => {
        const loop = Loop(() => {
          drawer.bgWork()
        })
          .start()

        onDestroy(() => {
          loop.destroy()
        })
      })),
      div(
        bottom("24px"),
        display("flex"),
        justifyContent("center"),
        position("absolute"),
        width("100%"),
        apd(button(apd(TextCanvas("WORK", { font: "16px monospace" })), onClick(() => {
          world.cash.set((_cash) => _cash + 5)
        }))),
      ),
    ),
  )
