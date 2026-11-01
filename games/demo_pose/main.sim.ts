// The kinds of main and the main.scene.json file next to this one: people walking the paths the scene's
// shapes lay down, walkways round a square on the ground and flight paths arcing over it from corner to
// corner, each shape saying what is played on it, the walk or a flying pose (`world.shapes3d.kinds`), so
// a person walks, takes off at a corner, flies in the path's pose, lands and walks on, crowd3d fading
// each change (`sky`, `person`). Every number of them that never changes is its definition in
// `assets/demo_pose.json`, which the scene's `world.defs` names. Where each seat's eye starts is a
// `start` actor of the scene file, one per slot.
import type { Scene, Sim } from '#engine/engine.ts'
import { scenemanager } from '#plugins/scenemanager/scenemanager.sim.ts'
import { loader } from '#plugins/loader/loader.sim.ts'
import { player } from './player.sim.ts'
import { start } from './start.sim.ts'
import { sky } from './sky.sim.ts'
import { person } from './person.sim.ts'
import { ground } from './ground.sim.ts'
import file from './main.scene.json' with { type: 'json' }

// The shapes have no rule of their own: shapes3d reads their rows.
const shapes = Object.fromEntries(Object.keys(file.world.shapes3d.kinds).map(kind => [kind, {}]))

export const sim: Sim = { ...shapes, scenemanager, loader, player, start, sky, person, ground }

export const scene = file as Scene
