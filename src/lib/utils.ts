import { exec, ExecException } from 'child_process'
import fs from 'fs'
import path from 'path'

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

export function writeStringToFile(fn: string, content: string) {
  ensureDir(path.dirname(fn))
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
