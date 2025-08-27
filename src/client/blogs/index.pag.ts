import { apd } from "#rokay/core"
import { div, h1, h2, i, p, section, span } from "rokay/browser/elt"
import { margin, maxWidth } from "rokay/browser/style"
import { Asink } from "rokay/prop/async"

import { Blog } from "../../shared/blogs/types.gen"
import { DateTime } from "../elts/date-time"
import { Loader } from "../elts/loader"


export const
  BlogsPage = (blogs: Asink<Blog[]>) => div(
    margin("0 auto"),
    maxWidth("80ch"),
    apd(h1(apd("The Kiki Blog")), Loader(blogs, (_blogs) =>
      div(apd(..._blogs.map((blog) =>
        section(apd(
          h2(apd(blog.name)),
          div(apd(
            "Created: ",
            blog.created == null ? i(apd("Uncommitted")) : DateTime(blog.created),
            blog.updated != null && blog.created !== blog.updated ?
              span(apd(" | Updated: ", DateTime(blog.updated)))
            :
              undefined,
          )),
          ...blog.contents.map((item) =>
            item.t === "h1" ? h2(apd(item.content)) : p(apd(item.content))
          )
        ))
      )))
    )),
  )
