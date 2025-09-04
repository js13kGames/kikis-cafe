import { TypeADT, TypeArray, TypeInt, TypeObject, TypeProp, TypeString } from "rokay/route/type"

import { Cat } from "../cats/types"


export const
  State = TypeADT({
    "outside": {},
    "inside": {},
    "work": {},
    "store": {},
  }),

  World = TypeObject({
    cash: TypeProp(TypeInt(), { editable: true }),
    cats: TypeArray(Cat),
    catsInside: TypeArray(Cat),
    time: TypeProp(TypeString(), { editable: true }),
  })
