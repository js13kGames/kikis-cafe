import { TypeADT, TypeArray, TypeObject, TypeOptional, TypeString } from "rokay/route/type"


export const
  BlogDatum = TypeADT({
    h1: { content: TypeString() },
    p: { content: TypeString() },
  }),

  Blog = TypeObject({
    contents: TypeArray(BlogDatum),
    created: TypeOptional(TypeString()),
    id: TypeString(),
    name: TypeString(),
    updated: TypeOptional(TypeString()),
  })
