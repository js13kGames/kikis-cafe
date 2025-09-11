import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { size as sizeAttr, value } from "rokay/browser/attr"
import { button, canvas, div, input } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { match, matchIf } from "rokay/browser/match"
import { onClick, onInput, onKeydown, onMousedown } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { bottom, display, flex, flexDirection, gap, justifyContent, minWidth, overflow, padding, position,
  top, width } from "rokay/browser/style"
import { divide_, floor_, V } from "rokay/math/v"
import { MixArgs } from "rokay/mix"

import { ActiveStateGlobal } from "../../shared/worlds/types.gen"
import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"
import { TextCanvas2 } from "../elts/text-canvas"
import { ActiveStateFocusFM, ActiveStateNameFM, StateOutsideFM, WorldFM } from "../worlds/form-models.gen"


export const
  WorldCanvas = (app: AppClient, assets: Assets, state: StateOutsideFM, world: WorldFM) => div(
    position("relative"),
    apd(
      canvas($(app.size, ({ size: { x, y } }) => sizeAttr(x, y)), withDrawer(
        app,
        assets,
        (drawer) => {
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

          state.state.listen((state) => {
            drawer.focus(state.t === "focus" || state.t === "name" ? state.cat : undefined)
          })

          onDestroy(onMousedown<HTMLCanvasElement>((el, _ev) => {
            const _state = state.state.get()
            if (_state.t !== "global") { return }

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
            if (cat != null) {
              state.state.set(() => {
                const state = ActiveStateFocusFM()
                state.cat = cat
                return state
              })
            }
          })(drawer.ctx.canvas))
        },
      )),

      matchIf(state.state, (_state) =>
        _state.t === "global" ?
          null
        : _state.t === "focus" ?
          InnerHUD(apd(
            UpperHUD(apd(match(_state.cat.name, (_name) =>
              TextCanvas2(
                _name.trim() || "Unnamed Cat",
                _name.trim() ? assets.font16 : assets.font16italic,
              )
            ))),
            LowerControls(apd(
              button(apd(TextCanvas2("Back", assets.font12)), onClick(() => {
                state.state.set(() => ActiveStateGlobal())
              })),
              button(apd(TextCanvas2("Catch", assets.font12)), onClick(() => {
                world.cats.set((_cats) => _cats.filter((c) => c !== _state.cat))
                world.catsInside.set((_cats) => _cats.concat(_state.cat))
                state.state.set(() => ActiveStateGlobal())
              })),
              button(apd(TextCanvas2("Name", assets.font12)), onClick(() => {
                state.state.set(() => {
                  const newState = ActiveStateNameFM()
                  newState.cat = _state.cat
                  return newState
                })
              })),
            )),
          ))
        :
          InnerHUD(apd(
            UpperHUD(apd(match(_state.cat.name, (_name) =>
              TextCanvas2(
                _name.trim() || "Unnamed Cat",
                _name.trim() ? assets.font16 : assets.font16italic,
              )
            ))),
            LowerControls(apd(
              button(apd(TextCanvas2("Back", assets.font12)), onClick(() => {
                state.state.set(() => ActiveStateGlobal())
              })),
              input(
                "text",
                flex("1"),
                minWidth("0"),
                $(_state.cat.name, value),
                onInput((el, _ev) => {
                  _state.cat.name.set(() => el.value)
                }),
                onKeydown((_el, ev) => {
                  if (ev.key === "Enter") {
                    state.state.set(() => {
                      const state = ActiveStateFocusFM()
                      state.cat = _state.cat
                      return state
                    })
                  }
                }),
              ),
            )),
          ))
      ),
    ),
  )


const
  InnerHUD = (...args: MixArgs<HTMLDivElement>) => div(
    bottom("0"),
    display("flex"),
    flexDirection("column"),
    justifyContent("space-between"),
    position("absolute"),
    top("0"),
    width("100%"),
    ...args
  ),

  UpperHUD = (...args: MixArgs<HTMLDivElement>) =>
    LowerControls(...args),

  LowerControls = (...args: MixArgs<HTMLDivElement>) =>
    div(display("flex"), gap("4px"), overflow("auto"), padding("4px"), width("100%"), ...args)
