import { resolve } from "path"
import { getDirname } from "rokay/server/node"
import { getRokayServerConfig } from "rokay/server/server"

import { Kiki } from "./kiki.js"


Kiki({
  server: getRokayServerConfig({
    port: 4141,
    staticDir: resolve(getDirname(import.meta), "..", "..", "static"),
  }),
})
