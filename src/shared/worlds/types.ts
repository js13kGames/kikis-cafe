import { TypeADT, TypeArray, TypeInt, TypeObject, TypeProp, TypeString } from "rokay/route/type"

import { Cat } from "../cats/types"


export const
  State = TypeADT({
    "outside": { focus: TypeProp(Cat, { editable: true, optional: true }) },
    "inside": { focus: TypeProp(Cat, { editable: true, optional: true }) },
    "work": {},
    "store": {},
  }),

  World = TypeObject({
    cash: TypeProp(TypeInt(), { editable: true }),
    cats: TypeProp(TypeArray(Cat), { editable: true }),
    catsInside: TypeProp(TypeArray(Cat), { editable: true }),
    time: TypeProp(TypeString(), { editable: true }),
  })
