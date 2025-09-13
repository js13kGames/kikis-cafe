import { onDestroy } from "#rokay/capture"
import { apd } from "rokay/browser/core"
import { a, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { LocalStore } from "rokay/browser/local-storage"
import { match } from "rokay/browser/match"
import { mount } from "rokay/browser/mount"
import { $ } from "rokay/browser/prop"
import { BrowserRouter } from "rokay/browser/router"
import { alignItems, flex, gap, justifyContent, overflow, padding, size, transform, transformOrigin,
  width } from "rokay/browser/style"
import { WindowSize } from "rokay/browser/window"
import { remove, tab } from "rokay/data/array"
import { float, int, pick } from "rokay/math/random"
import { divide, floor_, len, minus, plus_, scale_, unit, unitOfAng, V, WV } from "rokay/math/v"
import { mix } from "rokay/mix"
import { Asink } from "rokay/prop/async"
import { derive } from "rokay/prop/derive"
import { matchOpt } from "rokay/route/router"
import { WorldCanvas } from "worlds/world-canvas.js"

import { CAT_SPEED, RandomCat } from "../shared/cats/model.js"
import { CatStateDead, CatStateSit, CatStateStand, CatStateSuspend, CatStateWalk } from "../shared/cats/types.gen.js"
import { pgIndex, pgInside, pgStore, pgWork } from "../shared/pages.gen.js"
import { BLINK_RATE, CAT_RATE, SIT_RATE, SUSPEND_RATE, UNBLINK_RATE } from "../shared/rates.js"
import { ActiveStateGlobal, StateInside, StateOutside, StateStore, StateWork, World } from "../shared/worlds/types.gen.js"

import { AppClient } from "./app.js"
import { load } from "./assets.js"
import { Base } from "./base.syn.js"
import { CatFM } from "./cats/form-models.gen.js"
import { Loader } from "./elts/loader.js"
import { TextCanvas2 } from "./elts/text-canvas.js"
import { InsidePage } from "./inside.pag.js"
import { StorePage } from "./store.pag.js"
import { $flexCol, $flexRow, $relative } from "./style/utils.gen.js"
import { WorkPage } from "./work.pag.js"
import { StateFM, StateInsideFM, StateOutsideFM, toWorld, WorldFM } from "./worlds/form-models.gen.js"


mount(document.body, () => {
  const
    bound_ = (v: WV, { min, max }: { min: V, max: V }) => {
      v.x = Math.max(min.x, Math.min(v.x, max.x))
      v.y = Math.max(min.y, Math.min(v.y, max.y))
      return v
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
        world.cats.get().forEach((cat) => stepCat(cat, true))
        world.catsInside.get().forEach((cat) => stepCat(cat, false))
      }
      world.time.set((_time) => {
        const next = new Date(_time)
        next.setSeconds(next.getSeconds() + dt)
        return next.toISOString()
      })
    },

    stepCat = (cat: CatFM, outside: boolean) => {
      const _state = cat.state.get()
      if (_state.t === "dead") { return }
      const { bounds } = app.size.get()
      ++cat.attrs.age
      if (--cat.attrs.hunger <= 0 || --cat.attrs.thirst <= 0) {
        if (cat.state.get().t === "suspend") {
          // only kill it if it's on screen
          world.cats.set((_cats) => remove(_cats, cat))
        } else {
          cat.state.set(() => CatStateDead(cat.attrs.hunger <= 0 ? "Starved" : "Dehydration"))
        }
        return
      }
      cat.blink = cat.blink ? Math.random() >= UNBLINK_RATE : Math.random() < BLINK_RATE
      if (_state.t === "sit" || _state.t === "stand") {
        if (Math.random() < SIT_RATE) {
          let to = plus_(scale_(unitOfAng(Math.random() * 2 * Math.PI), int(50, 100)), cat.pos)
          if (outside) {
            to.y = Math.max(bounds.min.y, to.y)
          } else {
            to = bound_(to, bounds)
          }
          cat.state.set(() => CatStateWalk(to))
          cat.scale.x = to.x < cat.pos.x ? -1 : 1
        }
      } else if (_state.t === "suspend") {
        if (Math.random() < SUSPEND_RATE) {
          const { bounds } = app.size.get()
          const to = V(float(bounds.min.x, bounds.max.x), float(bounds.min.y, bounds.max.y))
          cat.state.set(() => CatStateWalk(to))
          cat.scale.x = to.x < cat.pos.x ? -1 : 1
        }
      } else if (_state.t === "walk") {
        const diff = minus(_state.to, cat.pos)
        if (len(diff) < CAT_SPEED) {
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
          cat.pos = plus_(scale_(unit(diff), CAT_SPEED), cat.pos)
        }
      }
    },

    TOP_HEIGHT = 17,

    router = BrowserRouter(),
    app: AppClient = {
      router,
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
    state = router.derive<
      StateFM
    >(
      [
        matchOpt(/^\/?$/, ([_]) => StateOutsideFM(StateOutside(ActiveStateGlobal()))),
        matchOpt(/^\/inside\/?$/, () => StateInsideFM(StateInside(ActiveStateGlobal()))),
        matchOpt(/^\/work\/?$/, () => StateWork()),
        matchOpt(/^\/store\/?$/, () => StateStore()),
      ],
      () => StateOutsideFM(),
    ),
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

  onDestroy(() => {
    loop.destroy()
  })

  return Base(app, Loader(assets, (assets) =>
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
          width("100%"),
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
            InsidePage(app, assets, state, world)
          : state.t === "outside" ?
            WorldCanvas(app, assets, true, world.cats, world.itemsOutside, state.state, world)
          : state.t === "store" ?
            StorePage(app, assets, world)
          :
            WorkPage(app, assets, world, step)
        ),

        div(
          flex(`0 0 ${TOP_HEIGHT}px`),
          $flexRow,
          gap("4px"),
          justifyContent("space-between"),
          overflow("auto"),
          padding("4px"),
          width("100%"),
          apd(
            a(app.router.href(pgIndex()), apd(TextCanvas2("Outside", assets.font9))),
            a(app.router.href(pgInside()), apd(TextCanvas2("Inside", assets.font9))),
            a(app.router.href(pgWork()), apd(TextCanvas2("Work", assets.font9))),
            a(app.router.href(pgStore()), apd(TextCanvas2("Store", assets.font9))),
          ),
        ),
      ),
    )
  ))
})
