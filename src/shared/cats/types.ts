import { TypeADT, TypeObject, TypeProp, TypeString } from "rokay/route/type"

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
    walk: {
      to: V
    },
  }),

  Cat = TypeObject({
    coat: TypeString(),
    eyes: TypeString(),
    name: TypeProp(TypeString(), { editable: true }),
    pos: V,
    scale: V,
    state: CatState,
  })
