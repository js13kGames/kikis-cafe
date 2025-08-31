import { TypeObject, TypeString } from "rokay/route/type"

import { V } from "../v/types"


export const
  Cat = TypeObject({
    coat: TypeString(),
    eyes: TypeString(),
    pos: V,
  })
