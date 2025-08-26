import { MixArgs } from "rokay/mix"
import { async, charset, lang, nonce, src } from "rokay/server/attr"
import { apd, Elt } from "rokay/server/core"
import { body, head, html, link, meta, script, title, _meta } from "rokay/server/elt"

import { AppServer } from "./app.js"


export const
  HTML = ({ cspNonce, user }: AppServer, ...args: MixArgs<Elt>) =>
    html(lang("en"), apd(
      head(apd(
        title(apd("Kiki")),

        _meta(charset("utf-8")),
        meta("apple-mobile-web-app-capable", "yes"),
        meta("format-detection", "telephone=no"),
        meta("theme-color", "#000"),
        meta("viewport", "initial-scale=1,user-scalable=no,width=device-width"),

        link("manifest", "/manifest.json"),
        link("stylesheet", "/kiki.css"),

        script(nonce(cspNonce), apd(
          `const USER = ${JSON.stringify(user.prop.get())}`
        )),
        script(async, src("/kiki.js")),
      )),
      body(...args)
    ))
