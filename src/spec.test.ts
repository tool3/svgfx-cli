import { describe, expect, it } from 'vitest'
import { fromConfig, parseSpec, toEffect } from './spec'

describe('parseSpec', () => {
  it('reads a bare effect name', () => {
    expect(parseSpec('bloom')).toEqual({ name: 'bloom', options: {} })
  })

  it('reads options after a colon', () => {
    expect(parseSpec('bloom:radius=8,threshold=0.5')).toEqual({
      name: 'bloom',
      options: { radius: 8, threshold: 0.5 },
    })
  })

  it('coerces booleans, numbers and null', () => {
    expect(parseSpec('halftone:levels=3,keepSource=true,background=null').options).toEqual({
      levels: 3,
      keepSource: true,
      background: null,
    })
  })

  it('treats a bare key as true', () => {
    expect(parseSpec('grain:animate').options).toEqual({ animate: true })
  })

  it('keeps colours as strings', () => {
    expect(parseSpec('glow:color=#ff2d55').options).toEqual({ color: '#ff2d55' })
  })

  it('accepts kebab-case option keys', () => {
    expect(parseSpec('halftone:keep-source=true').options).toEqual({ keepSource: true })
  })

  it('accepts kebab-case and camelCase effect names', () => {
    expect(parseSpec('hue-rotate:angle=90').name).toBe('hue-rotate')
    expect(parseSpec('hueRotate:angle=90').name).toBe('hueRotate')
    expect(parseSpec('chromaticAberration:offset=3').options).toEqual({ offset: 3 })
  })

  it('resolves presets by name', () => {
    expect(parseSpec('crt').name).toBe('crt')
    expect(parseSpec('riso:shadow=#123456').options).toEqual({ shadow: '#123456' })
  })

  it('rejects an unknown effect', () => {
    expect(() => parseSpec('blooom')).toThrow(/Unknown effect "blooom"/)
  })

  it('rejects an unknown option and suggests a close one', () => {
    expect(() => parseSpec('bloom:radiuss=4')).toThrow(/no option "radiuss".*Did you mean radius/s)
  })

  it('lists valid options for an effect that takes none', () => {
    expect(() => parseSpec('xerox:size=2')).toThrow(/Valid: none/)
  })
})

describe('toEffect', () => {
  it('builds a named effect the library understands', () => {
    expect(toEffect('bloom:radius=4').name).toBe('bloom')
    expect(toEffect('crt').name).toBe('crt')
  })
})

describe('fromConfig', () => {
  it('reads an array of objects', () => {
    const effects = fromConfig('[{"effect":"bloom","radius":6},{"preset":"crt"}]', 'test.json')
    expect(effects.map((effect) => effect.name)).toEqual(['bloom', 'crt'])
  })

  it('reads an effects property', () => {
    expect(fromConfig('{"effects":["grain"]}', 'test.json').map((e) => e.name)).toEqual(['grain'])
  })

  it('reads shorthand strings', () => {
    expect(fromConfig('["bloom:radius=2"]', 'test.json')[0]?.name).toBe('bloom')
  })

  it('rejects a shape that is not a list', () => {
    expect(() => fromConfig('{"nope":1}', 'test.json')).toThrow(/must contain an array of effects/)
  })

  it('rejects an unknown effect with the file name in the message', () => {
    expect(() => fromConfig('[{"effect":"nope"}]', 'fx.json')).toThrow(/fx.json: unknown effect "nope"/)
  })
})

describe('enum options', () => {
  it('accepts a valid choice', () => {
    expect(parseSpec('scanlines:clip=viewport').options).toEqual({ clip: 'viewport' })
    expect(parseSpec('blur:axis=horizontal').options).toEqual({ axis: 'horizontal' })
    expect(parseSpec('outline:position=inside').options).toEqual({ position: 'inside' })
  })

  it('rejects a typo instead of silently falling back', () => {
    expect(() => parseSpec('scanlines:clip=shapee')).toThrow(/must be one of shape, viewport, got "shapee"/)
    expect(() => parseSpec('blur:axis=sideways')).toThrow(/must be one of both, horizontal, vertical/)
  })
})
