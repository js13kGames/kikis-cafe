import { pick } from "rokay/math/random"
import { V } from "rokay/math/v"

import { Cat } from "./types.gen"


export const
  RandomCat = (pos: V) => Cat(
    pick(["#fff", "#000", "#f90", "#333", "#666", "#999", "#ccc"]),
    pick(["#ff0", "#0f0", "#00f"]),
    pos,
  )
