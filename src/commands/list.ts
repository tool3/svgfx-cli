import { EFFECTS, PRESETS } from '../effects'
import type { EffectMeta } from '../types'

const column = (entries: Readonly<Record<string, EffectMeta>>): number =>
  Object.keys(entries).reduce((widest, name) => Math.max(widest, name.length), 0)

const render = (title: string, entries: Readonly<Record<string, EffectMeta>>): readonly string[] => {
  const width = column(entries)
  return [
    '',
    title,
    '',
    ...Object.entries(entries).flatMap(([name, meta]) => {
      const flat = meta.options.filter((option) => meta.nested?.[option] === undefined)
      const options = flat.length > 0 ? `  [${flat.join(', ')}]` : ''
      const head = `  ${name.padEnd(width)}  ${meta.summary}${options}`
      const inner = Object.entries(meta.nested ?? {}).map(
        ([id, keys]) => `  ${' '.repeat(width)}    ${id}.[${keys.join(', ')}]`,
      )
      return [head, ...inner]
    }),
  ]
}

export const listCommand = (): void => {
  const lines = [
    ...render(`Effects (${Object.keys(EFFECTS).length})`, EFFECTS),
    ...render(`Presets (${Object.keys(PRESETS).length})`, PRESETS),
    '',
    'Options go after a colon, comma separated:',
    '',
    '  pstfx logo.svg -e "bloom:radius=8,threshold=0.5"',
    '  pstfx logo.svg -e halftone:size=5,angle=15 -e "grain:amount=0.3"',
    '',
    'Presets are stacks of effects. Reach inside one with a dot:',
    '',
    '  pstfx logo.svg -p "film:grain.amount=0.5"',
    '  pstfx logo.svg -p "crt:scanlines.gap=6,vignette.amount=0.9"',
    '',
  ]
  console.log(lines.join('\n'))
}
