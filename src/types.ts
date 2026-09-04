import type { Effect, OutputFormat } from '@svgfx/postprocessing'

export interface EffectMeta {
  readonly create: (options: Record<string, unknown>) => Effect
  readonly options: readonly string[]
  readonly summary: string
}

export interface EffectSpec {
  readonly name: string
  readonly options: Record<string, unknown>
}

export type InputKind = 'file' | 'stdin' | 'url'

export interface Input {
  readonly kind: InputKind
  readonly name: string
  readonly source: string
}

export interface CliOptions {
  readonly _: readonly (string | number)[]
  readonly effect: readonly string[]
  readonly preset: readonly string[]
  readonly config?: string
  readonly output?: string
  readonly inPlace: boolean
  readonly dataUri: boolean
  readonly base64: boolean
  readonly seed?: string
  readonly prefix?: string
  readonly scope?: string
  readonly animate: boolean
  readonly format: OutputFormat
  readonly quiet: boolean
}
