import { execSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { last } from "rokay/data/array"

import { Blog, BlogDatum, BlogDatumH1, BlogDatumP } from "../../shared/blogs/types.gen"


export type BlogDao = { read(args: BlogDaoReadArgs): Promise<BlogRow[]> }
export type BlogDaoReadArgs = {
  id?: string
  limit?: number
}
export type BlogRow = Blog


const
  COMMIT_HEADER = /^Author:(.*)\nDate:(.*)$/gm


export const
  BlogDao = (dir: string): BlogDao => {
    const blogs: Blog[] = readdirSync(dir)
      .map((id) => {
        const path = resolve(dir, id)
        const contents = parseBlogData(readFileSync(path).toString())
        const log = execSync(`git log -- ${path}`).toString()
        const commits = Array.from(log.matchAll(COMMIT_HEADER))
        const updated = commits.length ? new Date(commits[0][2]).toISOString() : undefined
        const created = commits.length ? new Date(last(commits)[2]).toISOString() : undefined

        return {
          contents: contents.content,
          created,
          id,
          name: contents.name ?? id,
          updated,
        }
      })
      .sort((a, b) =>
        b.updated == null ?
          a.updated == null ? 0 : 1
        : a.updated == null ?
          -1
        :
          b.updated.localeCompare(a.updated)
      )

    const dao: BlogDao = {
      read: ({ id }) => Promise.resolve(blogs.filter((blog) => id == null || blog.id === id)),
    }

    return dao
  }


//
const
  parseBlogData = (content: string): { name?: string, content: BlogDatum[] } => {
    const data = content.split(/(\n\s*){2,}/).map((untrimmed) => {
      const content = untrimmed.trim()
      return content.startsWith("#") ? BlogDatumH1(content) : BlogDatumP(content)
    })
    return data[0].t === "h1" ?
        { name: data[0].content, content: data.slice(1) }
      :
        { content: data }
  }
