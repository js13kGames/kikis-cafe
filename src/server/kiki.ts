import { resolve } from "path"
import { getDirname } from "rokay/server/node"
import { RokayServer } from "rokay/server/server"

import { APIs } from "./apis.gen.js"
import { AppServer } from "./app.js"
import { Base } from "./base.gen.js"
import { BlogService } from "./blogs/service.js"
import { KikiConfig } from "./config.js"
import { HTML } from "./html.js"


export const
  Kiki = (config: KikiConfig) => {
    const blogs = BlogService(resolve(
      getDirname(import.meta),
      "..",
      "..",
      "src",
      "shared",
      "blogs",
      "entries",
    ))
    RokayServer(
      "Kiki",
      config.server,
      [
        APIs(
          {
            blogs,
            HTML: (elt, req) => {
              const app = AppServer(req)
              return HTML(app, Base(app, elt))
            },
          },
          {},
        ),
      ],
      (req) => {
        const app = AppServer(req)
        return HTML(app, Base(app))
      },
    )
  }
