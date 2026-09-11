import type { PstfxSettings } from 'pstfx'
import type { CliOptions } from './types'

export const toSettings = (options: CliOptions): PstfxSettings => ({
  ...(options.seed === undefined ? {} : { seed: options.seed }),
  ...(options.prefix === undefined ? {} : { prefix: options.prefix }),
  ...(options.scope === undefined ? {} : { scope: options.scope }),
  clip: options.clip,
  animate: options.animate,
  format: options.format,
})
