// A person, drawn by crowd3d (`world.crowd3d.kinds`), who walks the paths the scene's shapes lay down
// (crowd3d's `travel`): along a walkway it walks, and at the foot of a flight path it flies it in that
// path's pose and lands at its far end to walk on, each shape saying what is played on it
// (`world.shapes3d.kinds.<kind>.data.crowd3d`). It stands in its first clip where the sky stood it until
// `wait`, seconds on the sky's clock, then sets out.
import type { Kind } from '#engine/engine.ts'
import { travel } from '#plugins/crowd3d/crowd3d.sim.ts'

export const person: Kind = {
  tick(me, _dt, w) {
    const time = w.find('sky').data.time
    if (time < me.data.wait) return
    travel(me, w, time)
  },
}
