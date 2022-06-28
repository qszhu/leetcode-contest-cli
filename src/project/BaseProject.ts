import fs from 'fs'
import path from 'path'

import { ensureDir, linkFile, runCmd, writeBinaryToFile, writeStringToFile } from '../lib/utils'
import { Language, Problem } from '../types'

export default abstract class BaseProject {
  private rootDir: string
  private libDir: string

  constructor(rootDir: string, libDir: string, contestId: string, problemId: string, private lang: Language) {
    this.rootDir = path.join(rootDir, contestId, problemId)
    this.libDir = path.join(libDir, this.lang)
    ensureDir(this.libDir)
  }

  private getSourceDir() {
    return path.join(this.rootDir, 'src', this.lang)
  }

  getSourceFn() {
    return path.join(this.getSourceDir(), `solution.${this.lang}`)
  }

  private linkLibDir() {
    const libDir = path.join(this.getSourceDir(), 'lib')
    if (fs.existsSync(libDir)) return

    linkFile(libDir, path.relative(libDir, this.libDir).substring(3))
  }

  getIdFn() {
    return path.join(this.rootDir, 'id')
  }

  getInputFn() {
    return path.join(this.rootDir, 'input')
  }

  getOutputFn() {
    return path.join(this.rootDir, 'output')
  }

  getScreenshotFn() {
    return path.join(this.rootDir, 'screenshot.png')
  }

  protected abstract getCodeTemplate(problem: Problem): string

  hasSolution() {
    return fs.existsSync(this.getSourceFn())
  }

  newSolution(problem: Problem) {
    if (!this.hasSolution()) {
      writeStringToFile(this.getSourceFn(), this.getCodeTemplate(problem))
      this.linkLibDir()
    }
    writeStringToFile(this.getIdFn(), problem.rawId)
    writeBinaryToFile(this.getScreenshotFn(), problem.screenShot)
    if (!fs.existsSync(this.getInputFn())) {
      writeStringToFile(this.getInputFn(), problem.input)
    }
    if (!fs.existsSync(this.getOutputFn())) {
      writeStringToFile(this.getOutputFn(), problem.output)
    }
  }

  private getBuildDir() {
    return path.join(this.rootDir, 'build', this.lang)
  }

  protected abstract getBuiltBaseFn(): string

  getBuiltFn(): string {
    return path.join(this.getBuildDir(), this.getBuiltBaseFn())
  }

  protected abstract getBuildCmd(srcFn: string, outFn: string): string

  async build() {
    const cmd = this.getBuildCmd(this.getSourceFn(), this.getBuiltFn())

    const { err, stderr } = await runCmd(cmd)
    if (err) throw new Error(stderr)

    console.error(stderr)
  }
}
