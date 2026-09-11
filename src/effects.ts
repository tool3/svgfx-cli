import * as fx from 'pstfx'
import type { EffectMeta } from './types'

const kebab = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const meta = (
  create: EffectMeta['create'],
  options: readonly string[],
  summary: string,
  nested: EffectMeta['nested'] = undefined,
): EffectMeta => ({ create, options, summary, nested })

const amount = ['amount']

export const EFFECTS: Readonly<Record<string, EffectMeta>> = {
  blur: meta(fx.blur, ['radius', 'axis'], 'Gaussian blur, optionally on one axis'),
  bloom: meta(fx.bloom, ['radius', 'threshold', 'intensity'], 'Bright-pass glow bleeding out of highlights'),
  glow: meta(fx.glow, ['color', 'radius', 'spread', 'intensity'], 'Coloured halo around the artwork'),
  shadow: meta(fx.shadow, ['x', 'y', 'blur', 'color', 'opacity'], 'Drop shadow'),
  grayscale: meta(fx.grayscale, amount, 'Desaturate'),
  saturate: meta(fx.saturate, amount, 'Boost or cut saturation'),
  'hue-rotate': meta(fx.hueRotate, ['angle'], 'Rotate hues around the colour wheel'),
  invert: meta(fx.invert, amount, 'Invert colours'),
  brightness: meta(fx.brightness, amount, 'Scale brightness'),
  contrast: meta(fx.contrast, amount, 'Scale contrast around mid-grey'),
  sepia: meta(fx.sepia, amount, 'Sepia tone'),
  fade: meta(fx.fade, amount, 'Reduce opacity'),
  posterize: meta(fx.posterize, ['steps', 'includeAlpha'], 'Quantise tones into flat bands'),
  threshold: meta(fx.threshold, ['level', 'dark', 'light'], 'Hard two-tone cut on luminance'),
  duotone: meta(fx.duotone, ['shadow', 'highlight', 'mix'], 'Map luminance onto two colours'),
  tint: meta(fx.tint, ['color', 'amount'], 'Wash a colour over the artwork'),
  grain: meta(fx.grain, ['amount', 'size', 'monochrome', 'blend', 'animate', 'speed'], 'Film grain'),
  scanlines: meta(
    fx.scanlines,
    ['gap', 'thickness', 'opacity', 'color', 'angle', 'blend', 'animate', 'speed', 'clip'],
    'CRT scanline overlay',
  ),
  'chromatic-aberration': meta(fx.chromaticAberration, ['offset', 'angle'], 'Split the RGB channels'),
  glitch: meta(fx.glitch, ['intensity', 'slices', 'colorShift', 'animate', 'speed'], 'Sliced and displaced bands'),
  pixelate: meta(fx.pixelate, ['size'], 'Mosaic blocks'),
  halftone: meta(
    fx.halftone,
    ['size', 'angle', 'levels', 'color', 'background', 'keepSource', 'clip'],
    'Print-style dot screen',
  ),
  vignette: meta(fx.vignette, ['amount', 'radius', 'softness', 'color', 'clip'], 'Darkened edges'),
  outline: meta(fx.outline, ['width', 'color', 'position'], 'Stroke around or inside the artwork'),
  wave: meta(fx.wave, ['amplitude', 'frequency', 'octaves', 'animate', 'speed'], 'Turbulent displacement'),
  emboss: meta(fx.emboss, ['depth', 'angle', 'desaturate'], 'Directional relief'),
  sharpen: meta(fx.sharpen, ['amount'], 'Edge sharpening'),
}

const effectOptions = (id: string): readonly string[] => EFFECTS[id]?.options ?? []

const recipe = (defaults: Readonly<Record<string, unknown>>): Readonly<Record<string, readonly string[]>> =>
  Object.fromEntries(Object.keys(defaults).map((id) => [id, effectOptions(kebab(id))]))

const preset = (
  create: EffectMeta['create'],
  shorthands: readonly string[],
  summary: string,
  defaults: Readonly<Record<string, unknown>>,
): EffectMeta => {
  const nested = recipe(defaults)
  return meta(create, [...shorthands, ...Object.keys(nested)], summary, nested)
}

export const PRESETS: Readonly<Record<string, EffectMeta>> = {
  crt: preset(fx.crt, ['animate'], 'Phosphor glow, scanlines, fringing, vignette', fx.CRT_DEFAULTS),
  vhs: preset(fx.vhs, ['animate'], 'Tape wobble, heavy fringing, rolling lines, noise', fx.VHS_DEFAULTS),
  riso: preset(fx.riso, ['shadow', 'highlight'], 'Two-colour risograph with paper grain', fx.RISO_DEFAULTS),
  xerox: preset(fx.xerox, [], 'Blown-out photocopy', fx.XEROX_DEFAULTS),
  neon: preset(fx.neon, ['color'], 'Saturated sign glow', fx.NEON_DEFAULTS),
  film: preset(fx.film, [], 'Halation, grain and a soft vignette', fx.FILM_DEFAULTS),
  newsprint: preset(fx.newsprint, [], 'Halftone dots on off-white stock', fx.NEWSPRINT_DEFAULTS),
  cyberpunk: preset(fx.cyberpunk, ['animate'], 'Sliced, shifted, bloomed, scanned', fx.CYBERPUNK_DEFAULTS),
}

export const camelKey = (key: string): string =>
  key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())


export const resolve = (name: string): EffectMeta | null => {
  const key = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  return EFFECTS[key] ?? PRESETS[key] ?? EFFECTS[name] ?? PRESETS[name] ?? null
}

export const normalizeKeys = (options: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(options).map(([key, value]) => [camelKey(key), value]))

export const names = (): readonly string[] => [...Object.keys(EFFECTS), ...Object.keys(PRESETS)]

const CHOICES: Readonly<Record<string, readonly string[]>> = {
  axis: ['both', 'horizontal', 'vertical'],
  blend: ['overlay', 'multiply', 'screen', 'soft-light', 'normal'],
  'scanlines.blend': ['multiply', 'overlay', 'screen', 'normal'],
  position: ['outside', 'inside'],
  clip: ['shape', 'viewport'],
}

export const canonical = (name: string): string => kebab(name)

export const choicesFor = (owner: string, key: string): readonly string[] | undefined =>
  CHOICES[`${kebab(owner)}.${key}`] ?? CHOICES[key]
