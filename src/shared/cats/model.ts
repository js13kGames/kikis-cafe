import { pick } from "rokay/math/random"
import { V } from "rokay/math/v"

import { Cat } from "./types.gen"


export const
  DARK_CAT_COATS = ["#000", "#333", "#666"],
  LIGHT_CAT_COATS = ["#fff", "#ccc", "#999", "#f90"],
  CAT_COATS = [...DARK_CAT_COATS, ...LIGHT_CAT_COATS],
  CAT_EYES = ["#ff0", "#0f0", "#00f"],

  RandomCat = (pos: V) =>
    Cat(pick(CAT_COATS), pick(CAT_EYES), pos)
