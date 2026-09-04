import { describe, expect, it } from 'vitest'
import { EFFECTS, PRESETS, names, normalizeKeys, resolve } from './effects'

describe('registry', () => {
  it('exposes every library effect and preset', () => {
    expect(Object.keys(EFFECTS)).toHaveLength(27)
    expect(Object.keys(PRESETS)).toHaveLength(8)
    expect(names()).toHaveLength(35)
  })

  it('gives every entry a summary', () => {
    Object.values({ ...EFFECTS, ...PRESETS }).forEach((meta) => {
      expect(meta.summary.length).toBeGreaterThan(0)
    })
  })

  it('creates a working effect from each entry with no options', () => {
    Object.entries({ ...EFFECTS, ...PRESETS }).forEach(([name, meta]) => {
      const effect = meta.create({})
      expect(effect.stages.length, name).toBeGreaterThan(0)
    })
  })

  it('resolves kebab-case and camelCase', () => {
    expect(resolve('hue-rotate')).toBe(EFFECTS['hue-rotate'])
    expect(resolve('hueRotate')).toBe(EFFECTS['hue-rotate'])
    expect(resolve('chromaticAberration')).toBe(EFFECTS['chromatic-aberration'])
  })

  it('returns null for anything unknown', () => {
    expect(resolve('nope')).toBeNull()
  })
})

describe('normalizeKeys', () => {
  it('converts kebab-case keys to camelCase', () => {
    expect(normalizeKeys({ 'keep-source': true, 'color-shift': false, size: 4 })).toEqual({
      keepSource: true,
      colorShift: false,
      size: 4,
    })
  })
})
