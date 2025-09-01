import { TypeADT, TypeArray, TypeObject } from "rokay/route/type"

import { Cat } from "../cats/types"


export const
  State = TypeADT({
    "outside": {},
    "inside": {},
    "work": {},
    "store": {},
  }),

  World = TypeObject({ cats: TypeArray(Cat) })
