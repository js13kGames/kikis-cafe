import { TypeADT, TypeBoolean, TypeInt, TypeObject, TypeProp, TypeString } from "rokay/route/type"

import { V } from "../v/types"


export const
  CatState = TypeADT({
    dead: { reason: TypeString() },
    sit: {},
    suspend: {},
    stand: {},
    walk: { to: V },
  }),

  Cattrs = TypeObject({
    age: TypeInt(),
    hunger: TypeInt(),
    thirst: TypeInt(),
  }),

  Cat = TypeObject({
    attrs: Cattrs,
    blink: TypeBoolean(),
    coat: TypeString(),
    eyes: TypeString(),
    name: TypeProp(TypeString(), { editable: true }),
    pos: V,
    scale: V,
    state: TypeProp(CatState, { editable: true }),
  })
