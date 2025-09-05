import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { TextCanvas } from "elts/text-canvas"
import { size as sizeAttr, width } from "rokay/browser/attr"
import { button, canvas, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { match, matchIf } from "rokay/browser/match"
import { onClick, onMousedown } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { bottom, display, flexDirection, gap, justifyContent, padding, position, top } from "rokay/browser/style"
import { divide_, floor_, V } from "rokay/math/v"

import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"
import { StateOutsideFM, WorldFM } from "../worlds/form-models.gen"


export const
  WorldCanvas = (app: AppClient, assets: Assets, state: StateOutsideFM, world: WorldFM) => div(
    position("relative"),
    apd(
      canvas($(app.size, ({ size: { x, y } }) => sizeAttr(x, y)), withDrawer(assets, (drawer) => {
        const loop = Loop(() => {
          drawer.track(() => {
            drawer.bg()
            world.cats.get().forEach((cat) => {
              drawer.cat(cat)
            })
          })
        })
          .start()

        onDestroy(() => {
          loop.destroy()
        })

        state.focus.listen((focus) => {
          drawer.focus(focus)
        })

        onDestroy(onMousedown<HTMLCanvasElement>((el, _ev) => {
          if (state.focus.get() != null) { return }

          const rect = el.getBoundingClientRect()
          const pos = floor_(divide_(
            V(_ev.clientX - rect.x, _ev.clientY - rect.y),
            app.size.get().zoom,
          ))

          const cat = world.cats.get().find((cat) =>
            cat.pos.x - 6 < pos.x
            && pos.x < cat.pos.x + 6
            && cat.pos.y - 12 < pos.y
            && pos.y < cat.pos.y + 2
          )
          state.focus.set(() => cat)
        })(drawer.ctx.canvas))
      })),

      matchIf(state.focus, (cat) => div(
        bottom("24px"),
        display("flex"),
        flexDirection("column"),
        justifyContent("space-between"),
        position("absolute"),
        top("0"),
        width("100%"),
        apd(
          div(padding("8px"), apd(match(cat.name, (_name) =>
            TextCanvas(_name.trim() || "Unnamed Cat", { font: "italic 16px monospace" })
          ))),
          div(gap("8px"), padding("8px"), apd(
            button(apd(TextCanvas("BACK", { font: "16px monospace" })), onClick(() => {
              state.focus.set(() => undefined)
            })),
            button(apd(TextCanvas("CATCH", { font: "16px monospace" })), onClick(() => {
              world.cats.set((_cats) => _cats.filter((c) => c !== cat))
              world.catsInside.set((_cats) => _cats.concat(cat))
              state.focus.set(() => undefined)
            })),
          )),
        ),
      )),
    ),
  )
