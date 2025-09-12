import { TypeADT, TypeArray, TypeInt, TypeMap, TypeObject, TypeProp, TypeString } from "rokay/route/type"

import { Cat } from "../cats/types"
import { Item } from "../items/types"


export const
  ActiveState = TypeADT({
    global: {},
    focus: { cat: Cat },
    place: { item: Item },
    name: { cat: Cat },
  }),

  State = TypeADT({
    "outside": { state: TypeProp(ActiveState, { editable: true }) },
    "inside": { state: TypeProp(ActiveState, { editable: true }) },
    "work": {},
    "store": {},
  }),

  World = TypeObject({
    cash: TypeProp(TypeInt(), { editable: true }),
    cats: TypeProp(TypeArray(Cat), { editable: true }),
    catsInside: TypeProp(TypeArray(Cat), { editable: true }),
    inventory: TypeProp(TypeArray(Item), { editable: true }),
    itemsInside: TypeProp(TypeMap(Item), { editable: true }),
    itemsOutside: TypeProp(TypeMap(Item), { editable: true }),
    time: TypeProp(TypeString(), { editable: true }),
  })
