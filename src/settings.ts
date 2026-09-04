import type { SvgfxSettings } from '@svgfx/postprocessing'
import type { CliOptions } from './types'

export const toSettings = (options: CliOptions): SvgfxSettings => ({
  ...(options.seed === undefined ? {} : { seed: options.seed }),
  ...(options.prefix === undefined ? {} : { prefix: options.prefix }),
  ...(options.scope === undefined ? {} : { scope: options.scope }),
  animate: options.animate,
  format: options.format,
})
