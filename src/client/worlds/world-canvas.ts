import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { size as sizeAttr, value } from "rokay/browser/attr"
import { button, canvas, div, input } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { match, matchIf } from "rokay/browser/match"
import { onClick, onInput, onKeydown, onMousedown } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { alignItems, bottom, flex, gap, justifyContent, minWidth, overflow, padding, pointerEvents, position,
  top, width } from "rokay/browser/style"
import { remove } from "rokay/data/array"
import { divide_, floor_, scale_, V } from "rokay/math/v"
import { MixArgs } from "rokay/mix"
import { derive } from "rokay/prop/derive"

import { ActiveStateGlobal } from "../../shared/worlds/types.gen"
import { AppClient } from "../app"
import { Assets } from "../assets"
import { withDrawer } from "../drawer"
import { matchInventory } from "../elts/inventory"
import { TextCanvas2 } from "../elts/text-canvas"
import { $absolute, $flexCol, $flexRow } from "../style/utils.gen"
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
                if (cat.state.get().t !== "suspend") { drawer.cat(cat) }
              })
              Object.entries(world.itemsOutside.get()).forEach(([posString, item]) => {
                const match = posString.match(/^(-?\d+),(-?\d+)$/)
                if (match == null) { return }
                drawer.item(item, scale_(V(parseInt(match[1], 10), parseInt(match[2], 10)), 16))
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
            if (_state.t === "global") {
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
            } else if (_state.t === "place") {
              const rect = el.getBoundingClientRect()
              const pos = floor_(divide_(
                V(_ev.clientX - rect.x, _ev.clientY - rect.y),
                app.size.get().zoom * 16,
              ))
              const item = world.itemsOutside.get()[`${pos.x},${pos.y}`]
              if (item != null) { return }
              world.itemsOutside.set(
                (_items) => ({ ..._items, [`${pos.x},${pos.y}`]: _state.item }),
              )
              world.inventory.set((_items) => remove(_items, _state.item))
              state.state.set(() => ActiveStateGlobal())
            }
          })(drawer.ctx.canvas))
        },
      )),

      matchIf(state.state, (_state) =>
        _state.t === "global" ?
          InnerHUD(apd(
            UpperHUD(),
            LowerControls(apd(matchInventory(assets, state.state, world.inventory))),
          ))
        : _state.t === "focus" ?
          InnerHUD(apd(
            UpperHUD(apd(
              match(_state.cat.name, (_name) => TextCanvas2(
                _name.trim() || "Unnamed Cat",
                _name.trim() ? assets.font16 : assets.font16italic,
              )),
              matchIf(derive(_state.cat.state, (_state) => _state.t === "dead"), (_state) =>
                TextCanvas2("(Deceased)", assets.font12)
              ),
            )),
            LowerControls(apd(
              button(apd(TextCanvas2("Back", assets.font12)), onClick(() => {
                state.state.set(() => ActiveStateGlobal())
              })),
              match(_state.cat.state, (_catState) =>
                _catState.t !== "dead" ?
                  button(apd(TextCanvas2("Catch", assets.font12)), onClick(() => {
                    world.cats.set((_cats) => remove(_cats, _state.cat))
                    world.catsInside.set((_cats) => _cats.concat(_state.cat))
                    state.state.set(() => ActiveStateGlobal())
                  }))
                :
                  undefined
              ),
              match(_state.cat.state, (_catState) =>
                _catState.t !== "dead" ?
                  button(apd(TextCanvas2("Name", assets.font12)), onClick(() => {
                    state.state.set(() => {
                      const newState = ActiveStateNameFM()
                      newState.cat = _state.cat
                      return newState
                    })
                  }))
                :
                  undefined
              ),
              match(_state.cat.state, (_catState) =>
                _catState.t === "dead" ?
                  button(apd(TextCanvas2("Clean", assets.font12)), onClick(() => {
                    world.cats.set((_cats) => remove(_cats, _state.cat))
                    state.state.set(() => ActiveStateGlobal())
                  }))
                :
                  undefined
              ),
            )),
          ))
        : _state.t === "name" ?
          InnerHUD(apd(
            UpperHUD(apd(
              match(_state.cat.name, (_name) => TextCanvas2(
                _name.trim() || "Unnamed Cat",
                _name.trim() ? assets.font16 : assets.font16italic,
              )),
              matchIf(derive(_state.cat.state, (_state) => _state.t === "dead"), (_state) =>
                TextCanvas2("(Deceased)", assets.font12)
              ),
            )),
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
        :
          undefined
      ),
    ),
  )


const
  InnerHUD = (...args: MixArgs<HTMLDivElement>) => div(
    bottom("0"),
    $flexCol,
    justifyContent("space-between"),
    pointerEvents("none"),
    $absolute,
    top("0"),
    width("100%"),
    ...args
  ),

  UpperHUD = (...args: MixArgs<HTMLDivElement>) => div(
    alignItems("start"),
    $flexCol,
    gap("4px"),
    overflow("auto"),
    padding("4px"),
    pointerEvents("initial"),
    width("100%"),
    ...args
  ),

  LowerControls = (...args: MixArgs<HTMLDivElement>) => div(
    $flexRow,
    gap("4px"),
    overflow("auto"),
    padding("4px"),
    pointerEvents("initial"),
    width("100%"),
    ...args
  )
