import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { disabled, size } from "rokay/browser/attr"
import { button, canvas, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { onClick } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { bottom, justifyContent } from "rokay/browser/style"
import { derive } from "rokay/prop/derive"

import { secondsInTicks } from "../shared/rates"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { withDrawer } from "./drawer"
import { TextCanvas2 } from "./elts/text-canvas"
import { $absolute, $flexRow, $relative, $w100 } from "./style/utils.gen"
import { StateWorkFM, WorldFM } from "./worlds/form-models.gen"


export const
  WorkPage = (
    app: AppClient,
    assets: Assets,
    state: StateWorkFM,
    world: WorldFM,
    step: (dt: number) => void,
  ) => {
    const inSmash = derive(state.smash, (_smash) => _smash > 0)

    return div($relative, apd(
      canvas($(app.size, ({ size: { x, y} }) => size(x, y)), withDrawer(app, assets, (drawer) => {
        const loop = Loop(() => {
          drawer.bgWork(inSmash.get())
        })
          .start()

        onDestroy(() => {
          loop.destroy()
        })
      })),
      div($absolute, bottom("4px"), $flexRow, justifyContent("center"), $w100, apd(
        button($(inSmash, disabled), apd(TextCanvas2("WORK", assets.font16)), onClick(() => {
          state.smash.set(() => secondsInTicks(1))
          world.cash.set((_cash) => _cash + 20)
          step(60 * 60)
        })),
      )),
    ))
  }
