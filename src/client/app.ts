import { V } from "rokay/math/v"
import { PropView } from "rokay/prop/prop"

import { App } from "../shared/app.js"


export type AppClient =
  & App
  & {
    size: PropView<
      {
        size: V
        windowSize: V
        zoom: number
      }
    >
  }
