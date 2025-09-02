import { TypeADT, TypeObject, TypeString } from "rokay/route/type"

import { V } from "../v/types"


export const
  CatState = TypeADT({
    bread: {},
    halloween: {},
    lick: {},
    play: {},
    sit: {},
    splay: {},
    stand: {},
    stretch: {},
    walk: {},
  }),

  Cat = TypeObject({
    coat: TypeString(),
    eyes: TypeString(),
    pos: V,
    scale: V,
    state: CatState,
  })
