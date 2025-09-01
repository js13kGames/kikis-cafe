import { apd } from "rokay/browser/core"
import { code, h2 } from "rokay/browser/elt"
import { mount } from "rokay/browser/mount"
import { BrowserRouter } from "rokay/browser/router"
import { WindowSize } from "rokay/browser/window"
import { tab } from "rokay/data/array"
import { int } from "rokay/math/random"
import { divide, floor_, V } from "rokay/math/v"
import { derive } from "rokay/prop/derive"

import { RandomCat } from "../shared/cats/model.js"
import { World } from "../shared/world/types.gen.js"

import { AppClient } from "./app.js"
import { Base } from "./base.syn.js"
import { IndexPages } from "./pages.gen.js"


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
    world = World(tab(10, () =>
      RandomCat(V(int(0, app.size.get().size.x), int(0, app.size.get().size.y)))
    ))

  return Base(app, router.match([...IndexPages({ appClient: app, world })], (path) => h2(
    apd("Page ", code(apd(path)), " Not Found"),
  )))
})
