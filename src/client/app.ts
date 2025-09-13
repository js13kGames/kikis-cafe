import { V } from "rokay/math/v"
import { PropView } from "rokay/prop/prop"


export type AppClient = {
  size: PropView<
    {
      bounds: { min: V, max: V }
      size: V
      windowSize: V
      zoom: number
    }
  >
}
