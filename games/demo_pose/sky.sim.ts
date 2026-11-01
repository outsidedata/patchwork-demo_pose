// The sky: one `sky` actor of the scene, and the scene's clock. `time` is the seconds its truth has run,
// the steps taken times the step's `dt`, as the page's clock counts them (crowd3d's), set at the start
// of every step; every person's `since` and `wait` are times on it. In its first step it stands its
// definition's `people` `person`s, each of a body of `bodies`, on one of the `rings` (metres from the
// middle) at a turn round it, both chosen by the die (`world.seed`), standing in `clip` until a `wait`
// the die chooses within `waits` ([least, most] seconds), when it joins the path nearest it there
// (`person.sim.ts`); `placed` says it has.
import type { Kind } from '#engine/engine.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import * as math from '#plugins/math/math.sim.ts'

export const sky: Kind = {
  before(me, dt, w) {
    me.data.time = (Math.round(me.data.time / dt) + 1) * dt
    if (me.data.placed) return
    me.data.placed = true
    const d = def(w, me.kind)
    const pick = <T>(all: T[]) => all[Math.floor(w.die() * all.length)]
    const time = me.data.time
    for (let i = 0; i < d.people; i++) {
      const r = pick<number>(d.rings), a = w.die() * 2 * Math.PI
      const at = [r * math.sin(a), 0, r * math.cos(a)]
      w.spawn('person', { body: pick(d.bodies), pos: at, to: [...at], since: time, clip: d.clip, wait: time + d.waits[0] + (d.waits[1] - d.waits[0]) * w.die() })
    }
  },
}
