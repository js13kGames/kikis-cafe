import { BlogService } from "./service.js"


export const
  getBlogs = (blogs: BlogService) =>
    blogs.all({})
