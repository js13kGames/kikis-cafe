import { apd } from "rokay/browser/core"
import { div, h2 } from "rokay/browser/elt"
import { match } from "rokay/browser/match"
import { Asink, Async } from "rokay/prop/async"
import { PropView } from "rokay/prop/prop"

import { ErrorDisplay } from "./error-display"


export const
  Loader = <T>(asink: Asink<T>, render: (t: T) => Node | undefined) =>
    LoaderProp(asink.prop, render),

  LoaderProp = <T>(prop: PropView<Async<T>>, render: (t: T) => Node | undefined) =>
    div(apd(
      match(prop, (prop) =>
        prop.t === "load" ?
          h2(apd("Loading..."))
        : prop.t === "error" ?
          ErrorDisplay(prop.error)
        :
          render(prop.data)
      ),
    ))


