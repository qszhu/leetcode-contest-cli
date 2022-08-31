import { exec, ExecException } from 'child_process'
import fs from 'fs'
import path from 'path'

import { convert } from "html-to-text"

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

export function ensureFnDir(fn: string) {
  ensureDir(path.dirname(fn))
}

export function writeStringToFile(fn: string, content: string) {
  ensureFnDir(fn)
  fs.writeFileSync(fn, content, 'utf-8')
}

export function writeBinaryToFile(fn: string, data: Buffer) {
  ensureDir(path.dirname(fn))
  fs.writeFileSync(fn, data)
}

export function linkFile(from: string, to: string) {
  if (fs.existsSync(from)) fs.unlinkSync(from)
  fs.symlinkSync(to, from)
}

export async function runCmd(
  cmd: string
): Promise<{ err: ExecException | null, stdout: string, stderr: string }> {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr })
    })
  })
}

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function extractContestId(url: string) {
  const m = url.match(/\/contest\/(.+?)\/?$/)
  if (m) return m[1]
}

export function extractOutput(htmlContent: string, cn: boolean) {
  const textContent = convert(htmlContent, {
    wordwrap: 100
  })
  const output = cn ? '输出[：:]' : 'Output:'
  return textContent.split('\n')
    .map(line => {
      const m = line.match(new RegExp(`${output}(.+)$`))
      return m ? m[1].trim() : ''
    })
    .filter(m => m.length > 0)
    .join('\n')
}
