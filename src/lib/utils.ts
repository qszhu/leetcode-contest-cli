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

export function readStringFromFile(fn: string) {
  return fs.readFileSync(fn, 'utf-8')
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

function trimStart(s: string, pat: RegExp): string {
  const m = s.match(pat)
  if (!m) return s
  return s.substring(m.index! + m[0].length)
}

const trimQuote = (s: string): string => trimStart(s, /> /).trim()

export function extractDescription(htmlContent: string): string {
  return convert(htmlContent, {
    wordwrap: 100
  })
}

export function extractOutput(htmlContent: string, cn: boolean) {
  const textContent = extractDescription(htmlContent)

  const output = cn ? /^(> )?输出[：:]/ : /^(> )?Output:/
  const isOutputStart = (line: string) => output.test(line)

  const explain = cn ? /^(> )?解释[：:]/ : /^(> )?Explanation:/
  const isOutputEnd = (line: string) => trimQuote(line).length === 0 || explain.test(line)

  const outputs: string[][] = []
  const lines = textContent.split('\n')
  let caseOutput: string[] = []
  let inCase = false
  for (const line of lines) {
    if (isOutputStart(line)) {
      const text = trimStart(line, output).trim()
      if (text.length > 0) caseOutput.push(text)
      inCase = true
    } else if (isOutputEnd(line)) {
      if (caseOutput.length > 0) outputs.push(caseOutput)
      caseOutput = []
      inCase = false
    } else if (inCase) caseOutput.push(trimQuote(line))
  }
  if (caseOutput.length > 0) outputs.push(caseOutput)
  return outputs.map(caseOutput => caseOutput.join('\n')).join('\n')
}
