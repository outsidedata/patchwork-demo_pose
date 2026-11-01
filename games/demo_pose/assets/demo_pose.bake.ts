// demo_pose's bake, `yarn bake demo_pose` (core's `scripts/bake.ts`): every body of `pose.rig.json`, a
// Mixamo character of the library, with every clip of the rig baked onto it by anim's export
// (`plugins/anim/anim.export.py`), packed by gltfpack and written as `<body>.glb` beside this file,
// where the scene's catalogue reads it. The export reads each clip's `.poses.json` beside its FBX and
// writes the poses they name beside its table; they are written here as `poses.json`, `{ poses }`,
// which crowd3d reads (`world.crowd3d.poses`). crowd3d reads nothing else the export measures, so the
// table is written to the bake's scratch folder and dropped.
import fs from 'node:fs'
import path from 'node:path'
import type { Tools } from '#scripts/bake.ts'

const here = import.meta.dirname
const root = path.join(here, '..', '..', '..')

export default async ({ blender, scratch }: Tools) => {
  const rig = path.join(here, 'pose.rig.json')
  const { bodies } = JSON.parse(fs.readFileSync(rig, 'utf8')) as { bodies: Record<string, string> }
  const outs = Object.keys(bodies).map(body => `${body}=${path.join(here, `${body}.glb`)}`)
  await blender(['--factory-startup', '--python-exit-code', '1', '--python', path.join(root, 'plugins', 'anim', 'anim.export.py'), '--', rig, scratch('table.json'), ...outs])
  for (const body of Object.keys(bodies)) console.log('wrote', path.relative(root, path.join(here, `${body}.glb`)))
  const poses = JSON.parse(fs.readFileSync(scratch('table.poses.json'), 'utf8')) as Record<string, unknown>
  const out = path.join(here, 'poses.json')
  fs.writeFileSync(out, `{\n  "poses": {\n${Object.entries(poses).map(([n, p]) => `    ${JSON.stringify(n)}: ${JSON.stringify(p)}`).join(',\n')}\n  }\n}\n`)
  console.log('wrote', path.relative(root, out), Object.keys(poses).join(', '))
}
