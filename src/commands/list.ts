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
    ...Object.entries(entries).map(([name, meta]) => {
      const options = meta.options.length > 0 ? `  [${meta.options.join(', ')}]` : ''
      return `  ${name.padEnd(width)}  ${meta.summary}${options}`
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
    '  svgfx logo.svg -e "bloom:radius=8,threshold=0.5"',
    '  svgfx logo.svg -e halftone:size=5,angle=15 -e "grain:amount=0.3"',
    '',
  ]
  console.log(lines.join('\n'))
}
