import { apd } from "rokay/browser/core"
import { a, div } from "rokay/browser/elt"
import { match } from "rokay/browser/match"
import { mount } from "rokay/browser/mount"
import { $ } from "rokay/browser/prop"
import { BrowserRouter } from "rokay/browser/router"
import { bottom, display, position, size, transform, transformOrigin, width } from "rokay/browser/style"
import { WindowSize } from "rokay/browser/window"
import { tab } from "rokay/data/array"
import { int } from "rokay/math/random"
import { divide, floor_, V } from "rokay/math/v"
import { mix } from "rokay/mix"
import { Asink } from "rokay/prop/async"
import { derive } from "rokay/prop/derive"
import { matchOpt } from "rokay/route/router"

import { RandomCat } from "../shared/cats/model.js"
import { pgIndex, pgInside, pgStore, pgWork } from "../shared/pages.gen.js"
import { State, StateInside, StateOutside, StateStore, StateWork, World } from "../shared/world/types.gen.js"

import { AppClient } from "./app.js"
import { load } from "./assets.js"
import { Base } from "./base.syn.js"
import { Loader } from "./elts/loader.js"
import { InsidePage } from "./inside.pag.js"
import { StorePage } from "./store.pag.js"
import { WorkPage } from "./work.pag.js"
import { WorldCanvas } from "./worlds/world-canvas.js"


mount(document.body, () => {
  const
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
    state = router.derive<
      State
    >(
      [
        matchOpt(/^\/?$/, ([_]) => StateOutside()),
        matchOpt(/^\/inside\/?$/, () => StateInside()),
        matchOpt(/^\/work\/?$/, () => StateWork()),
        matchOpt(/^\/store\/?$/, () => StateStore()),
      ],
      () => StateOutside(),
    ),
    world = World(tab(10, () =>
      RandomCat(V(int(0, app.size.get().size.x), int(0, app.size.get().size.y)))
    ))

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
            InsidePage()
          : state.t === "outside" ?
            WorldCanvas(app, assets, world)
          : state.t === "store" ?
            StorePage()
          :
            WorkPage()
        ),

        div(position("absolute"), bottom(0), display("flex"), width("100%"), apd(
          a(app.router.href(pgIndex()), apd("Outside")),
          a(app.router.href(pgInside()), apd("Inside")),
          a(app.router.href(pgWork()), apd("Work")),
          a(app.router.href(pgStore()), apd("Store")),
        )),
      ),
    )
  ))
})
