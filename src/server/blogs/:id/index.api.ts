import { ifNotFound } from "rokay/server/errors"

import { BlogService } from "../service.js"


export const
  getBlog = (blogs: BlogService, id: string) =>
    blogs.get(id).then(ifNotFound(`Could not find Blog with id ${id}`))
