import { ServerRouter } from "rokay/server/router"
import { RokayRequest } from "rokay/server/server"

import { App } from "../shared/app.js"


export type AppServer = App & { cspNonce: string }


export const
  AppServer = (req: RokayRequest): AppServer =>
    ({ cspNonce: req.cspNonce, router: ServerRouter(req) })
