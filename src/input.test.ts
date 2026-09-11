import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { expand, isUrl, read } from './input'

const seeded = (): string => {
  const root = mkdtempSync(join(tmpdir(), 'pstfx-in-'))
  writeFileSync(join(root, 'b.svg'), '<svg id="b"/>')
  writeFileSync(join(root, 'a.svg'), '<svg id="a"/>')
  writeFileSync(join(root, 'notes.txt'), 'ignore me')
  return root
}

describe('isUrl', () => {
  it('recognises http and https only', () => {
    expect(isUrl('https://example.com/a.svg')).toBe(true)
    expect(isUrl('http://example.com/a.svg')).toBe(true)
    expect(isUrl('./a.svg')).toBe(false)
    expect(isUrl('file:///a.svg')).toBe(false)
  })
})

describe('expand', () => {
  it('collects sorted svg files from a directory and ignores other files', () => {
    const root = seeded()
    expect(expand([root])).toEqual([join(root, 'a.svg'), join(root, 'b.svg')])
  })

  it('passes files, urls and dash through untouched', () => {
    const root = seeded()
    const single = join(root, 'a.svg')
    expect(expand([single, 'https://example.com/x.svg', '-'])).toEqual([
      single,
      'https://example.com/x.svg',
      '-',
    ])
  })

  it('reports a missing path', () => {
    expect(() => expand(['/definitely/not/here.svg'])).toThrow(/No such file or directory/)
  })

  it('reports a directory with no svgs', () => {
    const empty = mkdtempSync(join(tmpdir(), 'pstfx-empty-'))
    expect(() => expand([empty])).toThrow(/No .svg files found/)
  })
})

describe('read', () => {
  it('reads a file and reports its absolute path', async () => {
    const root = seeded()
    const input = await read(join(root, 'a.svg'))
    expect(input.kind).toBe('file')
    expect(input.source).toBe('<svg id="a"/>')
  })
})
