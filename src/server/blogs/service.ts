import { Blog } from "../../shared/blogs/types.gen.js"

import { BlogDao, BlogDaoReadArgs } from "./dao.js"


export type BlogService = {
  all(args: BlogDaoReadArgs): Promise<Blog[]>
  get(id: string): Promise<Blog | undefined>
}


export const
  BlogService = (dir: string): BlogService => {
    const
      readSingle = (id: string) => dao.read({ id, limit: 1 }).then((rows) => rows[0]),

      dao = BlogDao(dir),

      service: BlogService = {
        all: (args) => dao.read(args),

        get: (id) => readSingle(id),
      }

    return service
  }
