import { apd } from "rokay/browser/core"
import { code, h2 } from "rokay/browser/elt"
import { mount } from "rokay/browser/mount"
import { BrowserRouter } from "rokay/browser/router"
import { WindowSize } from "rokay/browser/window"
import { divide, floor_, VZ } from "rokay/math/v"
import { derive } from "rokay/prop/derive"

import { Cat } from "../shared/cats/types.gen.js"
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
    world = World([Cat("#000", "#ff0", VZ)])

  return Base(app, router.match([...IndexPages({ appClient: app, world })], (path) => h2(
    apd("Page ", code(apd(path)), " Not Found"),
  )))
})
