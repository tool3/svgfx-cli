import { mkdtempSync, mkdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { destination, write } from './output'
import type { Input } from './types'

const file = (name: string): Input => ({ kind: 'file', name, source: '<svg/>' })

const stdin: Input = { kind: 'stdin', name: 'stdin', source: '<svg/>' }

describe('destination', () => {
  it('returns null for a single input with no output, meaning stdout', () => {
    expect(destination(file('/a/logo.svg'), undefined, false, false)).toBeNull()
  })

  it('uses the output path verbatim for a single input', () => {
    expect(destination(file('/a/logo.svg'), 'out.svg', false, false)).toBe('out.svg')
  })

  it('joins the basename when the output is a directory', () => {
    expect(destination(file('/a/logo.svg'), 'dist/', false, false)).toBe('dist/logo.svg')
  })

  it('joins the basename for every input when batching', () => {
    expect(destination(file('/a/logo.svg'), 'dist', false, true)).toBe('dist/logo.svg')
  })

  it('returns the input path when overwriting in place', () => {
    expect(destination(file('/a/logo.svg'), undefined, true, false)).toBe('/a/logo.svg')
  })

  it('refuses to overwrite stdin in place', () => {
    expect(() => destination(stdin, undefined, true, false)).toThrow(/--in-place needs file inputs/)
  })

  it('refuses to write a batch to stdout', () => {
    expect(() => destination(file('/a/logo.svg'), undefined, false, true)).toThrow(/ambiguous/)
  })
})

describe('write', () => {
  it('creates missing directories', () => {
    const root = mkdtempSync(join(tmpdir(), 'svgfx-'))
    const target = join(root, 'nested', 'deep', 'out.svg')
    write(target, '<svg id="x"/>')
    expect(readFileSync(target, 'utf8')).toBe('<svg id="x"/>')
  })

  it('overwrites an existing file', () => {
    const root = mkdtempSync(join(tmpdir(), 'svgfx-'))
    mkdirSync(join(root, 'a'))
    const target = join(root, 'a', 'out.svg')
    write(target, 'first')
    write(target, 'second')
    expect(readFileSync(target, 'utf8')).toBe('second')
  })
})
