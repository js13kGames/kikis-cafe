import { getUserAsink } from "okay-site-login/client/users/service"
import { apd } from "rokay/browser/core"
import { code, h2 } from "rokay/browser/elt"
import { mount } from "rokay/browser/mount"
import { BrowserRouter } from "rokay/browser/router"

import { AppClient } from "./app.js"
import { Base } from "./base.syn.js"
import { IndexPages } from "./pages.gen.js"


mount(document.body, () => {
  const
    router = BrowserRouter(),
    app: AppClient = { router, user: getUserAsink() }

  return Base(app, router.match([...IndexPages({})], (path) => h2(
    apd("Page ", code(apd(path)), " Not Found"),
  )))
})
