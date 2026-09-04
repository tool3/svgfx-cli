import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import type { Input } from './types'

const looksLikeDirectory = (target: string): boolean =>
  target.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())

export const destination = (
  input: Input,
  output: string | undefined,
  inPlace: boolean,
  batch: boolean,
): string | null => {
  if (inPlace) {
    if (input.kind !== 'file') throw new Error('--in-place needs file inputs; stdin and URLs have nothing to overwrite.')
    return input.name
  }
  if (output === undefined) {
    if (batch) throw new Error('Writing several results to stdout is ambiguous. Pass -o <dir> or --in-place.')
    return null
  }
  if (looksLikeDirectory(output) || batch) return join(output, basename(input.name))
  return output
}

export const write = (target: string, contents: string): void => {
  const directory = dirname(target)
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true })
  writeFileSync(target, contents)
}
