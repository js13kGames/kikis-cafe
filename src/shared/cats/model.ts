import { int, pick } from "rokay/math/random"
import { V } from "rokay/math/v"

import { MAX_CAT_AGE, MAX_CAT_HUNGER, MAX_CAT_THIRST, ticksInDays, ticksInYears } from "../rates"

import { Cat, CatStateStand, Cattrs } from "./types.gen"


export const
  DARK_CAT_COATS = ["#000", "#333", "#666"],
  LIGHT_CAT_COATS = ["#fff", "#ccc", "#999", "#f90"],
  CAT_COATS = [...DARK_CAT_COATS, ...LIGHT_CAT_COATS],
  CAT_EYES = ["#ff0", "#0f0", "#00f", "#000"],
  CAT_SPEED = 10 / 60,
  SCATTER_SPEED = 30 / 60,

  RandomCat = ({ min, max }: { min: V, max: V }) => {
    const pos = V(int(min.x, max.x), int(min.y, max.y))
    return Cat(
      Cattrs(int(ticksInYears(1), MAX_CAT_AGE), int(ticksInDays(1), MAX_CAT_HUNGER), int(
        ticksInDays(1),
        MAX_CAT_THIRST,
      )),
      false,
      pick(CAT_COATS),
      pick(CAT_EYES),
      "",
      pos,
      V(pick([-1, 1]), 1),
      CatStateStand(),
    )
  }
