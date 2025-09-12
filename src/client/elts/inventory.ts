import { apd } from "#rokay/core"
import { size } from "rokay/browser/attr"
import { button, canvas, div } from "rokay/browser/elt"
import { image, withCtx } from "rokay/browser/game/danvas"
import { mapHTML } from "rokay/browser/map"
import { matchIf } from "rokay/browser/match"
import { onClick } from "rokay/browser/on"
import { backgroundColor, border } from "rokay/browser/style"
import { derive } from "rokay/prop/derive"
import { PropForm } from "rokay/prop/form"
import { $inv } from "style/kiki.gen"
import { $flexRow } from "style/utils.gen"
import { ActiveStateFM } from "worlds/form-models.gen"

import { Item } from "../../shared/items/types.gen"
import { ActiveStatePlace } from "../../shared/worlds/types.gen"
import { Assets } from "../assets"


export const
  matchInventory = (
    assets: Assets,
    activeState: PropForm<ActiveStateFM>,
    items: PropForm<Item[]>,
  ) =>
    matchIf(derive(items, (_items) => _items.length > 0), () => div(
      backgroundColor("hsl(345, 57%, 86%)"),
      border("1px solid #000"),
      $flexRow,
      mapHTML(items, (item) => button($inv, apd(ItemCanvas(assets, item)), onClick(() => {
        activeState.set(() => ActiveStatePlace(item))
      }))),
    )),

  ItemCanvas = (assets: Assets, item: Item) => canvas(size(16), withCtx(image(
    assets.items,
    (
      item.t === "waterBowl" ?
        0
      : item.t === "food" ?
        1
      :
        2
    ) * 16,
    0,
    16,
    16,
    0,
    0,
    16,
    16,
  )))
