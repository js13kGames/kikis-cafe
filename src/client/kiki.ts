import { onDestroy } from "#rokay/capture"
import { apd } from "rokay/browser/core"
import { a, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { LocalStore } from "rokay/browser/local-storage"
import { match } from "rokay/browser/match"
import { mount } from "rokay/browser/mount"
import { onClick } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { alignItems, flex, gap, justifyContent, overflow, padding, size, transform, transformOrigin } from "rokay/browser/style"
import { WindowSize } from "rokay/browser/window"
import { remove, tab } from "rokay/data/array"
import { float, int, pick } from "rokay/math/random"
import { divide, floor_, len, minus, plus_, scale_, unit, unitOfAng, V, WV } from "rokay/math/v"
import { mix } from "rokay/mix"
import { Asink } from "rokay/prop/async"
import { derive } from "rokay/prop/derive"
import { Prop } from "rokay/prop/prop"

import { CAT_SPEED, RandomCat, SCATTER_SPEED } from "../shared/cats/model.js"
import { CatStateDead, CatStateDrink, CatStateEat, CatStateSit, CatStateStand, CatStateSuspend, CatStateWalk } from "../shared/cats/types.gen.js"
import { keyToPos, posToKey, TILE_CENTER } from "../shared/items/model.js"
import { Item } from "../shared/items/types.gen.js"
import { BLINK_RATE, CAT_RATE, DRINK_RATE, EAT_RATE, MAX_CAT_HUNGER, MAX_CAT_THIRST, SIT_RATE, SUSPEND_RATE,
  UNBLINK_RATE } from "../shared/rates.js"
import { ActiveStateGlobal, StateInside, StateOutside, StateStore, StateWork, World } from "../shared/worlds/types.gen.js"

import { AppClient } from "./app.js"
import { load } from "./assets.js"
import { CatFM } from "./cats/form-models.gen.js"
import { Loader } from "./elts/loader.js"
import { TextCanvas2 } from "./elts/text-canvas.js"
import { StorePage } from "./store.pag.js"
import { $flexCol, $flexRow, $relative, $w100 } from "./style/utils.gen.js"
import { WorkPage } from "./work.pag.js"
import { StateFM, StateInsideFM, StateOutsideFM, StateWorkFM, toWorld, WorldFM } from "./worlds/form-models.gen.js"
import { WorldCanvas } from "./worlds/world-canvas.js"


mount(document.body, () => {
  const
    bound_ = (v: WV, { min, max }: { min: V, max: V }) => {
      v.x = Math.max(min.x, Math.min(v.x, max.x))
      v.y = Math.max(min.y, Math.min(v.y, max.y))
      return v
    },

    leavePos = (cat: CatFM) => {
      const { bounds, size } = app.size.get()
      return V(cat.pos.x > app.size.get().size.x / 2 ? size.x + 10 : -10, int(
        bounds.min.y,
        bounds.max.y,
      ))
    },

    randomWalk = (cat: CatFM, outside: boolean, bounds: { min: V, max: V }) => {
      let to = plus_(scale_(unitOfAng(Math.random() * 2 * Math.PI), int(50, 100)), cat.pos)
      if (outside) {
        to.y = Math.max(bounds.min.y, to.y)
      } else {
        to = bound_(to, bounds)
      }
      walk(cat, to)
    },

    scatter = (cat: CatFM) => {
      walk(cat, leavePos(cat), true)
    },

    walk = (cat: CatFM, to: V, scatter?: boolean) => {
      cat.state.set(() => CatStateWalk(to, { scatter }))
      cat.scale.x = to.x < cat.pos.x ? -1 : 1
    },

    spawnCat = () => {
      const cat = CatFM(RandomCat(app.size.get().bounds))
      cat.state.set(() => CatStateWalk(cat.pos))
      const { size } = app.size.get()
      cat.pos = V(cat.pos.x < size.x / 2 ? -10 : size.x + 10, cat.pos.y)
      cat.scale.x = cat.pos.x < 0 ? 1 : -1
      return cat
    },

    step = (dt = 1) => {
      for (let i = 0; i < dt; ++i) {
        if (Math.random() < CAT_RATE) { world.cats.set((_cats) => _cats.concat(spawnCat())) }
        world.cats.get().forEach((cat) => stepCat(cat, true, world.itemsOutside.get()))
        world.catsInside.get().forEach((cat) => stepCat(cat, false, world.itemsInside.get()))
      }
      world.time.set((_time) => {
        const next = new Date(_time)
        next.setSeconds(next.getSeconds() + dt)
        return next.toISOString()
      })
      const _state = state.get()
      if (_state.t === "work" && _state.smash.get() > 0) {
        _state.smash.set((_smash) => _smash - 1)
      }
    },

    stepCat = (cat: CatFM, outside: boolean, items: Record<string, Item>) => {
      const _state = cat.state.get()
      if (_state.t === "dead") { return }
      const { bounds } = app.size.get()
      ++cat.attrs.age
      if (--cat.attrs.hunger <= 0 || --cat.attrs.thirst <= 0) {
        if (cat.state.get().t === "suspend") {
          // only kill it if it's on screen
          world.cats.set((_cats) => remove(_cats, cat))
        } else {
          cat.state.set(() => CatStateDead(cat.attrs.hunger <= 0 ? "Hunger" : "Thirst"))
        }
        return
      }
      cat.blink = cat.blink ? Math.random() >= UNBLINK_RATE : Math.random() < BLINK_RATE
      if (_state.t === "drink") {
        const currentItem = items[posToKey(cat.pos)]
        if (currentItem?.t !== "waterBowl") {
          cat.state.set(() => CatStateStand())
        } else if (cat.attrs.thirst < MAX_CAT_THIRST) {
          cat.attrs.thirst += DRINK_RATE
          if (cat.attrs.thirst > MAX_CAT_THIRST) { randomWalk(cat, outside, bounds) }
        }
      } else if (_state.t === "eat") {
        const currentItem = items[posToKey(cat.pos)]
        if (currentItem?.t !== "food") {
          cat.state.set(() => CatStateStand())
        } else if (cat.attrs.hunger < MAX_CAT_HUNGER) {
          cat.attrs.hunger += EAT_RATE
          if (cat.attrs.hunger > MAX_CAT_HUNGER) { randomWalk(cat, outside, bounds) }
        }
      } else if (_state.t === "sit" || _state.t === "stand") {
        if (Math.random() < SIT_RATE) {
          if (Math.random() > cat.attrs.hunger / MAX_CAT_HUNGER) {
            const currentItem = items[posToKey(cat.pos)]
            if (currentItem?.t === "food") {
              cat.state.set(() => CatStateEat())
            } else {
              const entry = Object.entries(items).find(([_pos, item]) => item.t === "food")
              walk(cat, entry == null ? leavePos(cat) : plus_(keyToPos(entry[0]), TILE_CENTER))
            }
          } else if (Math.random() > cat.attrs.thirst / MAX_CAT_THIRST) {
            const currentItem = items[posToKey(cat.pos)]
            if (currentItem?.t === "waterBowl") {
              cat.state.set(() => CatStateDrink())
            } else {
              const entry = Object.entries(items).find(([_pos, item]) => item.t === "waterBowl")
              walk(cat, entry == null ? leavePos(cat) : plus_(keyToPos(entry[0]), TILE_CENTER))
            }
          } else {
            let to = plus_(scale_(unitOfAng(Math.random() * 2 * Math.PI), int(50, 100)), cat.pos)
            if (outside) {
              to.y = Math.max(bounds.min.y, to.y)
            } else {
              to = bound_(to, bounds)
            }
            walk(cat, to)
          }
        }
      } else if (_state.t === "suspend") {
        if (Math.random() < SUSPEND_RATE) {
          const { bounds } = app.size.get()
          const to = V(float(bounds.min.x, bounds.max.x), float(bounds.min.y, bounds.max.y))
          cat.state.set(() => CatStateWalk(to))
          cat.scale.x = to.x < cat.pos.x ? -1 : 1
        }
      } else if (_state.t === "walk") {
        const
          diff = minus(_state.to, cat.pos),
          speed = _state.scatter ? SCATTER_SPEED : CAT_SPEED
        if (len(diff) < speed) {
          cat.pos = _state.to
          if (
            outside
            && (cat.pos.x < bounds.min.x || cat.pos.x > bounds.max.x || cat.pos.y > bounds.max.y)
          ) {
            cat.state.set(() => CatStateSuspend())
            const _state = state.get()
            if (_state.t === "outside") {
              const _innerState = _state.state.get()
              if (_innerState.t === "focus" && _innerState.cat === cat) {
                _state.state.set(() => ActiveStateGlobal())
              }
            }
          } else {
            cat.state.set(() => pick([CatStateSit(), CatStateStand()]))
          }
        } else {
          cat.pos = plus_(scale_(unit(diff), speed), cat.pos)
        }
      }
    },

    TOP_HEIGHT = 17,

    //router = BrowserRouter(),
    app: AppClient = {
      //router,
      size: derive(WindowSize(), (windowSize) => {
        const zoom = windowSize.x < 640 || windowSize.y < 640 ? 3 : 4
        const size = floor_(divide(windowSize, zoom))
        size.y -= 2 * TOP_HEIGHT // top and bottom bars
        return {
          bounds: { min: V(0, 48), max: V(size.x, size.y) },
          size,
          windowSize,
          zoom,
        }
      }),
    },
    assets = Asink({
      gen: () => load(),
    }),
    state = Prop<StateFM>(StateOutsideFM(StateOutside(ActiveStateGlobal()))),
    // router.derive<
    //   StateFM
    // >(
    //   [
    //     matchOpt(/^\/?$/, ([_]) => StateOutsideFM(StateOutside(ActiveStateGlobal()))),
    //     matchOpt(/^\/inside\/?$/, () => StateInsideFM(StateInside(ActiveStateGlobal()))),
    //     matchOpt(/^\/work\/?$/, () => StateWorkFM(StateWork(0))),
    //     matchOpt(/^\/store\/?$/, () => StateStore()),
    //   ],
    //   () => StateOutsideFM(),
    // ),
    worldLS = LocalStore("dlb-kiki.world", () => World(
      100,
      tab(10, () => RandomCat(app.size.get().bounds)),
      [],
      [],
      {},
      {},
      new Date().toISOString(),
    )),
    world = WorldFM(worldLS.get()),

    loop = Loop(() => {
      step()
      worldLS.set(toWorld(world))
    })
      .start()

  world.cats.set((_cats) => _cats.filter((cat) => cat.state.get().t !== "dead"))
  world.catsInside.set((_cats) => _cats.filter((cat) => cat.state.get().t !== "dead"))

  onDestroy(() => {
    loop.destroy()
  })

  return apd(Loader(assets, (assets) =>
    div(
      $flexCol,
      $relative,
      $(app.size, ({ size: { x, y }, zoom }) => mix(
        size(x + "px", (y + 2 * TOP_HEIGHT) + "px"),
        transform(`scale(${zoom})`),
      )),
      transformOrigin("top left"),
      apd(
        div(
          alignItems("start"),
          flex(`0 0 ${TOP_HEIGHT}px`),
          $flexRow,
          justifyContent("space-between"),
          overflow("auto"),
          padding("4px 4px 3px"),
          $relative,
          $w100,
          apd(match(world.cash, (_cash) => TextCanvas2(`$${_cash}`, assets.font9)), match(
            world.time,
            (_time) => {
              const date = new Date(_time)
              return TextCanvas2(
                date.toLocaleString(undefined, {
                  year: "2-digit",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                }),
                assets.font9,
              )
            },
          )),
        ),

        match(state, (state) =>
          state.t === "inside" ?
            WorldCanvas(
              app,
              assets,
              false,
              world.catsInside,
              world.itemsInside,
              state.state,
              world,
              { scatter },
            )
          : state.t === "outside" ?
            WorldCanvas(app, assets, true, world.cats, world.itemsOutside, state.state, world, {
              scatter,
            })
          : state.t === "store" ?
            StorePage(app, assets, world)
          :
            WorkPage(app, assets, state, world, step)
        ),

        div(
          flex(`0 0 ${TOP_HEIGHT}px`),
          $flexRow,
          gap("4px"),
          justifyContent("space-between"),
          overflow("auto"),
          padding("4px"),
          $w100,
          apd(
            a(
              onClick(() => {
                state.set(StateOutsideFM(StateOutside(ActiveStateGlobal())))
              }),
              apd(TextCanvas2("Outside", assets.font9)),
            ),
            a(
              onClick(() => {
                state.set(StateInsideFM(StateInside(ActiveStateGlobal())))
              }),
              apd(TextCanvas2("Inside", assets.font9)),
            ),
            a(
              onClick(() => {
                state.set(StateWorkFM(StateWork(0)))
              }),
              apd(TextCanvas2("Work", assets.font9)),
            ),
            a(
              onClick(() => {
                state.set(StateStore())
              }),
              apd(TextCanvas2("Store", assets.font9)),
            ),
          ),
        ),
      ),
    )
  ))
})
