import { CHOICES, normalizeKeys, resolve } from './effects'
import type { EffectSpec } from './types'
import type { Effect } from '@svgfx/postprocessing'

const coerce = (raw: string): unknown => {
  const value = raw.trim()
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value === '') return true
  return Number.isFinite(Number(value)) ? Number(value) : value
}

const pair = (entry: string): readonly [string, unknown] => {
  const index = entry.indexOf('=')
  return index === -1 ? [entry.trim(), true] : [entry.slice(0, index).trim(), coerce(entry.slice(index + 1))]
}

const suggest = (name: string, valid: readonly string[]): string => {
  const close = valid.filter((option) => option.toLowerCase().startsWith(name.slice(0, 3).toLowerCase()))
  return close.length > 0 ? ` Did you mean ${close.join(' or ')}?` : ''
}

export const parseSpec = (raw: string): EffectSpec => {
  const separator = raw.indexOf(':')
  const name = (separator === -1 ? raw : raw.slice(0, separator)).trim()
  const body = separator === -1 ? '' : raw.slice(separator + 1)

  const meta = resolve(name)
  if (meta === null) throw new Error(`Unknown effect "${name}". Run \`svgfx list\` to see everything available.`)

  const options = normalizeKeys(
    Object.fromEntries(
      body
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .map(pair),
    ),
  )

  const unknown = Object.keys(options).filter((key) => !meta.options.includes(key))
  if (unknown.length > 0) {
    const first = unknown[0] as string
    throw new Error(
      `"${name}" has no option "${first}". Valid: ${meta.options.join(', ') || 'none'}.${suggest(first, meta.options)}`,
    )
  }

  const invalid = Object.entries(options).find(([key, value]) => {
    const allowed = CHOICES[key]
    return allowed !== undefined && !allowed.includes(String(value))
  })
  if (invalid !== undefined) {
    const [key, value] = invalid
    throw new Error(`"${name}" option "${key}" must be one of ${(CHOICES[key] ?? []).join(', ')}, got "${String(value)}".`)
  }

  return { name, options }
}

export const toEffect = (raw: string): Effect => {
  const spec = parseSpec(raw)
  const meta = resolve(spec.name)
  if (meta === null) throw new Error(`Unknown effect "${spec.name}".`)
  return meta.create(spec.options)
}

export const fromConfig = (contents: string, origin: string): readonly Effect[] => {
  const parsed: unknown = JSON.parse(contents)
  const list = Array.isArray(parsed) ? parsed : (parsed as { effects?: unknown }).effects
  if (!Array.isArray(list)) throw new Error(`${origin} must contain an array of effects, or an { "effects": [...] } object.`)

  return list.map((entry) => {
    if (typeof entry === 'string') return toEffect(entry)
    const { effect, preset, ...options } = entry as Record<string, unknown>
    const name = String(effect ?? preset ?? '')
    const meta = resolve(name)
    if (meta === null) throw new Error(`${origin}: unknown effect "${name}".`)
    return meta.create(normalizeKeys(options))
  })
}
