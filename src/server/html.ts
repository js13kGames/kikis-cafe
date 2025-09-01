import { MixArgs } from "rokay/mix"
import { async, charset, lang, src } from "rokay/server/attr"
import { apd, Elt } from "rokay/server/core"
import { _meta, body, head, html, link, meta, script, title } from "rokay/server/elt"

import { AppServer } from "./app.js"


export const
  HTML = ({}: AppServer, ...args: MixArgs<Elt>) => html(lang("en"), apd(
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
    body(...args),
  ))
