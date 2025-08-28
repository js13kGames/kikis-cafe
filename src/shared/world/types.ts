import { TypeArray, TypeObject } from "rokay/route/type"

import { Cat } from "../cats/types"


export const
  World = TypeObject({ cats: TypeArray(Cat) })
