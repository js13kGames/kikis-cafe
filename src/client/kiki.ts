import { onDestroy } from "#rokay/capture"
import { CatFM } from "cats/form-models.gen.js"
import { apd } from "rokay/browser/core"
import { a, div } from "rokay/browser/elt"
import { Loop } from "rokay/browser/game/loop"
import { match } from "rokay/browser/match"
import { mount } from "rokay/browser/mount"
import { $ } from "rokay/browser/prop"
import { BrowserRouter } from "rokay/browser/router"
import { bottom, display, gap, overflow, padding, position, size, transform, transformOrigin, width } from "rokay/browser/style"
import { WindowSize } from "rokay/browser/window"
import { tab } from "rokay/data/array"
import { int, pick } from "rokay/math/random"
import { divide, floor_, len, minus, plus_, scale_, unit, unitOfAng, V } from "rokay/math/v"
import { mix } from "rokay/mix"
import { Asink } from "rokay/prop/async"
import { derive } from "rokay/prop/derive"
import { Prop } from "rokay/prop/prop"
import { matchOpt } from "rokay/route/router"

import { CAT_SPEED, RandomCat } from "../shared/cats/model.js"
import { CatStateSit, CatStateStand, CatStateWalk } from "../shared/cats/types.gen.js"
import { pgIndex, pgInside, pgStore, pgWork } from "../shared/pages.gen.js"
import { StateStore, StateWork, World } from "../shared/worlds/types.gen.js"

import { AppClient } from "./app.js"
import { load } from "./assets.js"
import { Base } from "./base.syn.js"
import { Loader } from "./elts/loader.js"
import { TextCanvas } from "./elts/text-canvas.js"
import { InsidePage } from "./inside.pag.js"
import { CAT_RATE } from "./rates.js"
import { StorePage } from "./store.pag.js"
import { WorkPage } from "./work.pag.js"
import { StateFM, StateInsideFM, StateOutsideFM, WorldFM } from "./worlds/form-models.gen.js"
import { WorldCanvas } from "./worlds/world-canvas.js"


mount(document.body, () => {
  const
    step = () => {
      ticks.set(ticks.get() - 1)
      if (Math.random() < CAT_RATE) {
        world.cats.push(RandomCat(V(int(0, app.size.get().size.x), int(0, app.size.get().size.y))))
      }
      worldFM.cats.get().forEach(stepCat)
      worldFM.catsInside.get().forEach(stepCat)
    },

    stepCat = (cat: CatFM) => {
      if (cat.state.t === "sit" || cat.state.t === "stand") {
        if (Math.random() < 1 / 360) {
          cat.state = CatStateWalk(plus_(
            scale_(unitOfAng(Math.random() * 2 * Math.PI), int(50, 100)),
            cat.pos,
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

    router = BrowserRouter(),
    app: AppClient = {
      router,
      size: derive(WindowSize(), (windowSize) => {
        const zoom = 4
        return {
          size: floor_(divide(windowSize, zoom)),
          windowSize,
          zoom,
        }
      }),
    },
    assets = Asink({
      gen: () => load(),
    }),
    state = router.derive<StateFM>(
      [
        matchOpt(/^\/?$/, ([_]) => {
          const state = StateOutsideFM({ t: "outside" })
          state.focus.set(() => undefined)
          return state
        }),
        matchOpt(/^\/inside\/?$/, () => {
          const state = StateInsideFM({ t: "inside" })
          state.focus.set(() => undefined)
          return state
        }),
        matchOpt(/^\/work\/?$/, () => StateWork()),
        matchOpt(/^\/store\/?$/, () => StateStore()),
      ],
      () => StateOutsideFM(),
    ),
    ticks = Prop(0),
    world = World(
      100,
      tab(10, () => RandomCat(V(int(0, app.size.get().size.x), int(0, app.size.get().size.y)))),
      [],
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
      position("relative"),
      $(app.size, ({ size: { x, y }, zoom }) => mix(
        size(x + "px", y + "px"),
        transform(`scale(${zoom})`),
      )),
      transformOrigin("top left"),
      apd(
        match(state, (state) =>
          state.t === "inside" ?
            InsidePage(app, assets, state, worldFM)
          : state.t === "outside" ?
            WorldCanvas(app, assets, state, worldFM)
          : state.t === "store" ?
            StorePage(app, assets)
          :
            WorkPage(app, assets, worldFM)
        ),

        div(
          position("absolute"),
          bottom(0),
          display("flex"),
          gap("8px"),
          overflow("auto"),
          padding("8px"),
          width("100%"),
          apd(
            a(app.router.href(pgIndex()), apd(TextCanvas("Outside"))),
            a(app.router.href(pgInside()), apd(TextCanvas("Inside"))),
            a(app.router.href(pgWork()), apd(TextCanvas("Work"))),
            a(app.router.href(pgStore()), apd(TextCanvas("Store"))),
          ),
        ),
      ),
    )
  ))
})
