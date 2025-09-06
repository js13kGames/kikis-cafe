import { V } from "rokay/math/v"
import { PropView } from "rokay/prop/prop"

import { App } from "../shared/app.js"


export type AppClient =
  & App
  & {
    size: PropView<
      {
        bounds: { min: V, max: V }
        size: V
        windowSize: V
        zoom: number
      }
    >
  }
