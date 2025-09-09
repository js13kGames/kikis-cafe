import { size as sizeAttr, src } from "rokay/browser/attr"
import { apd } from "rokay/browser/core"
import { div, img } from "rokay/browser/elt"
import { match } from "rokay/browser/match"
import { alignItems, justifyContent, left, size, top } from "rokay/browser/style"
import { Asink, Async } from "rokay/prop/async"
import { PropView } from "rokay/prop/prop"
import { $absolute, $flexRow } from "style/utils.gen"

import { ErrorDisplay } from "./error-display"


export const
  Loader = <T>(asink: Asink<T>, render: (t: T) => Node | undefined) =>
    LoaderProp(asink.prop, render),

  LoaderProp = <T>(prop: PropView<Async<T>>, render: (t: T) => Node | undefined) => div(
    apd(match(prop, (prop) =>
      prop.t === "load" ?
        div(
          alignItems("center"),
          $flexRow,
          justifyContent("center"),
          $absolute,
          top("0"),
          left("0"),
          size("100%"),
          apd(img(src("/art/icons/16.png"), sizeAttr(16), size("256px"))),
        )
      : prop.t === "error" ?
        ErrorDisplay(prop.error)
      :
        render(prop.data)
    )),
  )
