import { MixArgs } from "rokay/mix"
import { async, charset, lang, size as sizeAttr, src } from "rokay/server/attr"
import { apd, Elt } from "rokay/server/core"
import { _meta, body, div, head, html, img, link, meta, script, title } from "rokay/server/elt"
import { alignItems, display, justifyContent, size } from "rokay/server/style"

import { AppServer } from "./app.js"


export const
  HTML = ({}: AppServer, ...args: MixArgs<Elt>) => html(
    lang("en"),
    apd(
      head(apd(
        title(apd("Kiki")),

        _meta(charset("utf-8")),
        meta("mobile-web-app-capable", "yes"),
        meta("apple-mobile-web-app-capable", "yes"),
        meta("format-detection", "telephone=no"),
        meta("theme-color", "#000"),
        meta("viewport", "initial-scale=1,user-scalable=no,width=device-width"),

        link("icon", "/art/icons/16.png"),
        link("manifest", "/manifest.json"),
        link("stylesheet", "/kiki.css"),

        script(async, src("/kiki.js")),
      )),
      body(
        apd(div(
          alignItems("center"),
          display("flex"),
          justifyContent("center"),
          apd(img(src("/art/icons/16.png"), sizeAttr(16), size("64px"))),
        )),
        ...args
      ),
    ),
  )
