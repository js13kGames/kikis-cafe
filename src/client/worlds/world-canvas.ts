import { onDestroy } from "#rokay/capture"
import { apd } from "#rokay/core"
import { size as sizeAttr, value } from "rokay/browser/attr"
import { button, canvas, div, input } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { match, matchIf } from "rokay/browser/match"
import { onClick, onInput, onKeydown, onMousedown } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { alignItems, bottom, flex, gap, justifyContent, minWidth, overflow, padding, pointerEvents, top } from "rokay/browser/style"
import { remove } from "rokay/data/array"
import { divide_, floor_, V } from "rokay/math/v"
import { MixArgs } from "rokay/mix"
import { derive } from "rokay/prop/derive"
import { PropForm } from "rokay/prop/form"

import { keyToPos } from "../../shared/items/model"
import { Item } from "../../shared/items/types.gen"
import { ActiveStateGlobal } from "../../shared/worlds/types.gen"
import { AppClient } from "../app"
import { Assets } from "../assets"
import { CatFM } from "../cats/form-models.gen"
import { withDrawer } from "../drawer"
import { matchInventory } from "../elts/inventory"
import { TextCanvas2 } from "../elts/text-canvas"
import { $absolute, $flexCol, $flexRow, $relative, $w100 } from "../style/utils.gen"
import { ActiveStateFM, ActiveStateFocusFM, ActiveStateNameFM, WorldFM } from "../worlds/form-models.gen"


export const
  WorldCanvas = (
    app: AppClient,
    assets: Assets,
    canCatch: boolean,
    cats: PropForm<CatFM[]>,
    items: PropForm<Record<string, Item>>,
    state: PropForm<ActiveStateFM>,
    world: WorldFM,
  ) =>
    div($relative, apd(
      canvas($(app.size, ({ size: { x, y } }) => sizeAttr(x, y)), withDrawer(
        app,
        assets,
        (drawer) => {
          const loop = Loop(() => {
            drawer.track(() => {
              if (canCatch) {
                drawer.bg()
              } else {
                drawer.bgInside()
              }
              Object.entries(items.get()).forEach(([posString, item]) => {
                drawer.item(item, keyToPos(posString))
              })
              cats.get().sort((a, b) => a.pos.y - b.pos.y).forEach((cat) => {
                drawer.cat(cat)
              })
            })
          })
            .start()

          onDestroy(() => {
            loop.destroy()
          })

          state.listen((state) => {
            drawer.focus(state.t === "focus" || state.t === "name" ? state.cat : undefined)
          })

          onDestroy(onMousedown<HTMLCanvasElement>((el, _ev) => {
            const _state = state.get()
            if (_state.t === "global") {
              const rect = el.getBoundingClientRect()
              const pos = floor_(divide_(
                V(_ev.clientX - rect.x, _ev.clientY - rect.y),
                app.size.get().zoom,
              ))

              const cat = cats.get().find((cat) =>
                cat.pos.x - 6 < pos.x
                && pos.x < cat.pos.x + 6
                && cat.pos.y - 12 < pos.y
                && pos.y < cat.pos.y + 2
              )
              if (cat != null) {
                state.set(() => {
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
              const item = items.get()[`${pos.x},${pos.y}`]
              if (item != null) { return }
              items.set((_items) => ({ ..._items, [`${pos.x},${pos.y}`]: _state.item }))
              world.inventory.set((_items) => remove(_items, _state.item))
              state.set(() => ActiveStateGlobal())
            }
          })(drawer.ctx.canvas))
        },
      )),

      matchIf(state, (_state) =>
        _state.t === "global" ?
          InnerHUD(apd(
            UpperHUD(),
            LowerControls(apd(matchInventory(assets, state, world.inventory))),
          ))
        : _state.t === "focus" ?
          InnerHUD(apd(
            UpperHUD(apd(
              match(_state.cat.name, (_name) => TextCanvas2(
                _name.trim() || "Unnamed Cat",
                _name.trim() ? assets.font16 : assets.font16italic,
              )),
              matchIf(
                derive(_state.cat.state, (_state) => _state.t === "dead" ? _state : undefined),
                (_state) => TextCanvas2(`(Deceased: ${_state.reason})`, assets.font12),
              ),
            )),
            LowerControls(apd(
              button(apd(TextCanvas2("Back", assets.font12)), onClick(() => {
                state.set(() => ActiveStateGlobal())
              })),
              match(_state.cat.state, (_catState) =>
                _catState.t !== "dead" && canCatch ?
                  button(apd(TextCanvas2("Catch", assets.font12)), onClick(() => {
                    world.cats.set((_cats) => remove(_cats, _state.cat))
                    world.catsInside.set((_cats) => _cats.concat(_state.cat))
                    state.set(() => ActiveStateGlobal())
                  }))
                :
                  undefined
              ),
              match(_state.cat.state, (_catState) =>
                _catState.t !== "dead" ?
                  button(apd(TextCanvas2("Name", assets.font12)), onClick(() => {
                    state.set(() => {
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
                    cats.set((_cats) => remove(_cats, _state.cat))
                    state.set(() => ActiveStateGlobal())
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
              matchIf(
                derive(_state.cat.state, (_state) => _state.t === "dead" ? _state : undefined),
                (_state) => TextCanvas2(`(Deceased: ${_state.reason})`, assets.font12),
              ),
            )),
            LowerControls(apd(
              button(apd(TextCanvas2("Back", assets.font12)), onClick(() => {
                state.set(() => ActiveStateGlobal())
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
                    state.set(() => {
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
    ))


const
  InnerHUD = (...args: MixArgs<HTMLDivElement>) => div(
    bottom("0"),
    $flexCol,
    justifyContent("space-between"),
    pointerEvents("none"),
    $absolute,
    top("0"),
    $w100,
    ...args
  ),

  UpperHUD = (...args: MixArgs<HTMLDivElement>) => div(
    alignItems("start"),
    $flexCol,
    gap("4px"),
    overflow("auto"),
    padding("4px"),
    pointerEvents("initial"),
    $w100,
    ...args
  ),

  LowerControls = (...args: MixArgs<HTMLDivElement>) => div(
    $flexRow,
    gap("4px"),
    overflow("auto"),
    padding("4px"),
    pointerEvents("initial"),
    $w100,
    ...args
  )
