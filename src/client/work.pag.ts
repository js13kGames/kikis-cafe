import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { size } from "rokay/browser/attr"
import { button, canvas, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { onClick } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { bottom, display, justifyContent, position, width } from "rokay/browser/style"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { withDrawer } from "./drawer"
import { TextCanvas } from "./elts/text-canvas"
import { WorldFM } from "./worlds/form-models.gen"


export const
  WorkPage = (app: AppClient, assets: Assets, world: WorldFM) => div(
    position("relative"),
    apd(
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
        bottom("4px"),
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
