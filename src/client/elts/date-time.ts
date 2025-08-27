import { datetime, title } from "rokay/browser/attr"
import { apd } from "rokay/browser/core"
import { span } from "rokay/browser/elt"


export const
  /**
   * Displays the given date as a span with datetime and title set
   **/
  DateTime = (date: Date | number | string) => {
    const
      d = new Date(date),
      now = new Date()

    return span(datetime(d.toISOString()), title(d.toLocaleString()), apd(
      d.getFullYear() !== now.getFullYear() ?
        d.toLocaleDateString()
      : d.getMonth() !== now.getMonth() || d.getDate() !== now.getDate() ?
        d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" })
      :
        d.toLocaleString(undefined, { hour: "numeric", minute: "numeric" }),
    ))
  }
