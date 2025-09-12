import { onDestroy } from "#rokay/capture"
import { apd } from "rokay/browser/core"
import { a, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { match } from "rokay/browser/match"
import { mount } from "rokay/browser/mount"
import { $ } from "rokay/browser/prop"
import { BrowserRouter } from "rokay/browser/router"
import { alignItems, flex, gap, justifyContent, overflow, padding, size, transform, transformOrigin,
  width } from "rokay/browser/style"
import { WindowSize } from "rokay/browser/window"
import { tab } from "rokay/data/array"
import { int, pick } from "rokay/math/random"
import { divide, floor_, len, minus, plus_, scale_, unit, unitOfAng, V, WV } from "rokay/math/v"
import { mix } from "rokay/mix"
import { Asink } from "rokay/prop/async"
import { derive } from "rokay/prop/derive"
import { Prop } from "rokay/prop/prop"
import { matchOpt } from "rokay/route/router"

import { CAT_SPEED, RandomCat } from "../shared/cats/model.js"
import { CatStateSit, CatStateStand, CatStateWalk } from "../shared/cats/types.gen.js"
import { pgIndex, pgInside, pgStore, pgWork } from "../shared/pages.gen.js"
import { ActiveStateGlobal, StateInside, StateOutside, StateStore, StateWork, World } from "../shared/worlds/types.gen.js"

import { AppClient } from "./app.js"
import { load } from "./assets.js"
import { Base } from "./base.syn.js"
import { CatFM } from "./cats/form-models.gen.js"
import { Loader } from "./elts/loader.js"
import { TextCanvas2 } from "./elts/text-canvas.js"
import { InsidePage } from "./inside.pag.js"
import { CAT_RATE } from "./rates.js"
import { StorePage } from "./store.pag.js"
import { $flexCol, $flexRow, $relative } from "./style/utils.gen.js"
import { WorkPage } from "./work.pag.js"
import { StateFM, StateInsideFM, StateOutsideFM, WorldFM } from "./worlds/form-models.gen.js"
import { WorldCanvas } from "./worlds/world-canvas.js"


mount(document.body, () => {
  const
    bound_ = (v: WV, { min, max }: { min: V, max: V }) => {
      v.x = Math.max(min.x, Math.min(v.x, max.x))
      v.y = Math.max(min.y, Math.min(v.y, max.y))
      return v
    },

    step = () => {
      ticks.set(ticks.get() - 1)
      worldFM.time.set((_time) => {
        const next = new Date(_time)
        next.setSeconds(next.getSeconds() + 1)
        return next.toISOString()
      })
      if (Math.random() < CAT_RATE) { world.cats.push(RandomCat(app.size.get().bounds)) }
      worldFM.cats.get().forEach(stepCat)
      worldFM.catsInside.get().forEach(stepCat)
    },

    stepCat = (cat: CatFM) => {
      if (cat.state.t === "sit" || cat.state.t === "stand") {
        if (Math.random() < 1 / 360) {
          cat.state = CatStateWalk(bound_(
            plus_(scale_(unitOfAng(Math.random() * 2 * Math.PI), int(50, 100)), cat.pos),
            app.size.get().bounds,
          ))
          cat.scale.x = cat.state.to.x < cat.pos.x ? -1 : 1
        }
      } else if (cat.state.t === "walk") {
        const diff = minus(cat.state.to, cat.pos)
        if (len(diff) < CAT_SPEED) {
          cat.pos = cat.state.to
          cat.state = pick([CatStateSit(), CatStateStand()])
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
    ticks = Prop(0),
    world = World(
      100,
      tab(10, () => RandomCat(app.size.get().bounds)),
      [],
      [],
      {},
      {},
      new Date().toISOString(),
    ),
    worldFM = WorldFM(world),

    loop = Loop(() => {
      step()
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
          apd(match(worldFM.cash, (_cash) => TextCanvas2(`$${_cash}`, assets.font9)), match(
            worldFM.time,
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
            InsidePage(app, assets, state, worldFM)
          : state.t === "outside" ?
            WorldCanvas(app, assets, state, worldFM)
          : state.t === "store" ?
            StorePage(app, assets, worldFM)
          :
            WorkPage(app, assets, worldFM)
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
