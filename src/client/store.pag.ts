import { apd, ApdArg } from "#rokay/core"
import { disabled, size } from "rokay/browser/attr"
import { button, canvas, div } from "rokay/browser/elt"
import { withCtx } from "rokay/browser/game/danvas"
import { onClick } from "rokay/browser/on"
import { $ } from "rokay/browser/prop"
import { alignItems, backgroundColor, flex, gap, left, overflow, padding, size as sizeStyle, top, width } from "rokay/browser/style"
import { MixArgs } from "rokay/mix"

import { Item, ItemFood, ItemLitter, ItemWaterBowl } from "../shared/items/types.gen"

import { AppClient } from "./app"
import { Assets } from "./assets"
import { ItemCanvas } from "./elts/inventory"
import { TextCanvas2 } from "./elts/text-canvas"
import { $store } from "./style/kiki.gen"
import { $absolute, $flexCol, $flexRow, $relative } from "./style/utils.gen"
import { WorldFM } from "./worlds/form-models.gen"


export const
  StorePage = (app: AppClient, assets: Assets, world: WorldFM) => {
    const
      ItemButton = (label: ApdArg, cost: number, item: () => Item) => div(
        alignItems("center"),
        $flexCol,
        gap("5px"),
        apd(
          button(
            $store,

            apd(label),
            $(world.cash, (_cash) => disabled(_cash < cost)),
            flex("0 0 auto"),
            onClick(() => {
              const _cash = world.cash.get()
              if (_cash >= cost) {
                world.cash.set((_cash) => _cash - cost)
                world.items.set((_items) => _items.concat(item()))
              }
            }),
            sizeStyle("48px"),
          ),
          TextCanvas2(`$${cost}`, assets.font9),
        ),
      ),

      ItemShelf = (label: string, ...args: MixArgs<HTMLDivElement>) => div(
        $relative,
        apd(
          canvas(size(app.size.get().size.x, 72), withCtx((ctx) => {
            ctx.fillStyle = "hsl(3,26%,30%)"
            ctx.fillRect(0, 0, ctx.canvas.width, 40)
            ctx.fillStyle = "hsl(43,16%,42%)"
            ctx.fillRect(0, 40, ctx.canvas.width, 20)
            ctx.fillStyle = "hsl(46,42%,78%)"
            ctx.fillRect(0, 60, ctx.canvas.width, 11)
            ctx.fillStyle = "rgba(0,0,0,.25)"
            ctx.fillRect(0, 61, ctx.canvas.width, 5)
            ctx.fillStyle = "#000"
            ctx.fillRect(0, 71, ctx.canvas.width, 1)
          })),
          div(
            $absolute,
            $flexRow,
            gap("8px"),
            left(0),
            overflow("auto"),
            padding("8px"),
            top(0),
            width("100%"),
            ...args
          ),
          div($absolute, left("4px"), top("4px"), apd(TextCanvas2(label, assets.font9))),
        ),
      )

    return div(
      backgroundColor("hsl(3, 26%, 10%)"),
      overflow("auto"),
      $relative,
      $(app.size, ({ size: { x, y } }) => sizeStyle(x + "px", y + "px")),
      apd(// canvas($(app.size, ({ size: { x, y} }) => size(x, y)), withDrawer(app, assets, (drawer) => {
      //   const loop = Loop(() => {
      //     drawer.bgStore()
      //   })
      //     .start()
      //   onDestroy(() => {
      //     loop.destroy()
      //   })
      // })),
      div($flexCol, apd(
        ItemShelf("Food", apd(
          ItemButton(ItemCanvas(assets, ItemFood()), 20, () => ItemFood()),
          ItemButton("Good Food", 30, () => ItemFood()),
          ItemButton("Better Food", 40, () => ItemFood()),
          ItemButton("Best Food", 50, () => ItemFood()),
          ItemButton("Bestest Food", 60, () => ItemFood()),
        )),
        ItemShelf("Devices", apd(ItemButton(ItemCanvas(assets, ItemWaterBowl()), 200, () =>
          ItemWaterBowl()
        ))),
        ItemShelf("Litter", apd(
          ItemButton(ItemCanvas(assets, ItemLitter()), 30, () => ItemLitter()),
        )),
      ))),
    )
  }
