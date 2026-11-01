// The seat's eye, for the row that is `mine`: render3d's camera at the row's `pos`, looking along its
// `view` [yaw, pitch], set whole as a quaternion every frame. W and S fly forward and back, A and D
// turn, Q and E tilt up and down, Shift climbs and Control sinks, the wheel paces.
//
// ] and [ go through the people crowd3d draws (`world.crowd3d.kinds`), by their row ids, one on and
// one back, and past either end back to the eye: the camera follows the one chosen, its definition's
// `follow` metres behind and `rise` over where it stands now (crowd3d's `where`, at the step's clock
// crowd3d draws by), looking at its definition's `look` metres over its feet. Which one is followed is
// the page's alone, as the camera is.
import type * as THREE from 'three'
import type { Row } from '#engine/engine.ts'
import type { Plugins } from '#engine/browser.ts'
import { def } from '#plugins/loader/loader.sim.ts'
import type { Binds } from '#plugins/player/player.plugin.ts'
import { where } from '#plugins/crowd3d/crowd3d.sim.ts'

let ours = false
let turn: THREE.Euler
let watched: number | undefined // the row id of the person followed, or none for the eye
let people: () => Row[] = () => []

// One on through the people, or one back, past either end to the eye.
function next(by: number) {
  const ids = people().map(r => r.id).sort((a, b) => a - b)
  if (!ids.length) return
  const at = watched === undefined ? -1 : ids.indexOf(watched)
  const to = at === -1 ? (by > 0 ? 0 : ids.length - 1) : at + by
  watched = to < 0 || to >= ids.length ? undefined : ids[to]
}

export function setup(row: Row, plugins: Plugins) {
  ours = row.data.mine === true
  if (!ours) return
  turn = new (plugins.render3d.THREE as typeof THREE).Euler(0, 0, 0, 'YXZ')
  const { turnRate, tiltRate } = def(plugins.wire, row.kind)
  let turned = performance.now()
  const kinds: string[] = plugins.wire.scene.world!.crowd3d.kinds
  people = () => plugins.wire.rows.filter(r => kinds.includes(r.kind))
  watched = undefined
  plugins.player.bind({
    press: { ']': () => next(1), '[': () => next(-1) },
    stick: [{ keys: ['F13', 'F14', 'w', 's'], send: (x, y) => ['stick', x, y] }],
    hold: [
      { keys: ['Shift'], send: v => ['up', v] },
      { keys: ['Control'], send: v => ['down', v] },
    ],
    every: held => {
      const now = performance.now(), dt = Math.min((now - turned) / 1000, 0.1)
      turned = now
      const yaw = (held('a') ? 1 : 0) - (held('d') ? 1 : 0), pitch = (held('q') ? 1 : 0) - (held('e') ? 1 : 0)
      return yaw || pitch ? ['look', yaw * turnRate * dt, pitch * tiltRate * dt] : undefined
    },
    wheel: dy => ['pace', dy],
  } satisfies Binds)
}

export function tick(row: Row, plugins: Plugins) {
  if (!ours) return
  const camera: THREE.PerspectiveCamera | undefined = plugins.render3d.camera
  if (!camera) return
  const them = watched === undefined ? undefined : people().find(r => r.id === watched)
  if (watched !== undefined && !them) watched = undefined
  if (them) {
    const wire = plugins.wire
    const time = (wire.between === undefined ? wire.n : wire.n - 1 + wire.between) * (wire.scene.prefabs.engine.dt as number)
    const [x, y, z] = where(them, time)
    const { follow, rise, look } = def(wire, row.kind)
    const yaw = them.data.yaw
    camera.position.set(x - Math.sin(yaw) * follow, y + rise, z - Math.cos(yaw) * follow)
    camera.lookAt(x, y + look, z)
    return
  }
  camera.position.fromArray(row.data.pos)
  // Three's camera looks down −z; yaw θ + π turns it to (sin θ, cos θ).
  camera.quaternion.setFromEuler(turn.set(row.data.view[1], row.data.view[0] + Math.PI, 0))
}

export function remove(plugins: Plugins) {
  if (ours) plugins.player.unbind()
}
