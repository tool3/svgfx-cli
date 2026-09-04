import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, extname, join, resolve as resolvePath } from 'node:path'
import type { Input } from './types'

const SVG_EXTENSION = '.svg'

export const isUrl = (value: string): boolean => /^https?:\/\//i.test(value)

export const hasPipedStdin = (): boolean => !process.stdin.isTTY

export const readStdin = async (): Promise<string> => {
  const chunks = await new Promise<readonly Buffer[]>((accept, fail) => {
    const collected: Buffer[] = []
    process.stdin.on('data', (chunk: Buffer) => collected.push(chunk))
    process.stdin.on('end', () => accept(collected))
    process.stdin.on('error', fail)
  })
  return Buffer.concat(chunks).toString('utf8')
}

const fromUrl = async (url: string): Promise<Input> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not fetch ${url} (HTTP ${response.status}).`)
  return { kind: 'url', name: basename(new URL(url).pathname) || 'input.svg', source: await response.text() }
}

const fromFile = (path: string): Input => ({
  kind: 'file',
  name: resolvePath(path),
  source: readFileSync(path, 'utf8'),
})

const svgsIn = (directory: string): readonly string[] =>
  readdirSync(directory)
    .filter((entry) => extname(entry).toLowerCase() === SVG_EXTENSION)
    .sort()
    .map((entry) => join(directory, entry))

export const expand = (targets: readonly string[]): readonly string[] =>
  targets.flatMap((target) => {
    if (isUrl(target) || target === '-') return [target]
    if (!existsSync(target)) throw new Error(`No such file or directory: ${target}`)
    if (!statSync(target).isDirectory()) return [target]
    const found = svgsIn(target)
    if (found.length === 0) throw new Error(`No .svg files found in ${target}`)
    return found
  })

export const read = async (target: string): Promise<Input> =>
  target === '-'
    ? { kind: 'stdin', name: 'stdin', source: await readStdin() }
    : isUrl(target)
      ? fromUrl(target)
      : fromFile(target)

export const collect = async (targets: readonly string[]): Promise<readonly Input[]> => {
  if (targets.length === 0) {
    if (!hasPipedStdin()) return []
    return [{ kind: 'stdin', name: 'stdin', source: await readStdin() }]
  }
  const expanded = expand(targets)
  return expanded.reduce<Promise<readonly Input[]>>(
    async (chain, target) => [...(await chain), await read(target)],
    Promise.resolve([]),
  )
}
