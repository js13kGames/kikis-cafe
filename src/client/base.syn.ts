import { apd, ApdArg } from "rokay/browser/core"

import { App } from "../shared/app.js"


export const
  Base = (_app: App, ...args: ApdArg[]) =>
    apd(...args)
