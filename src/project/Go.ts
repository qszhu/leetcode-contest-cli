import fs from 'fs'

import Project from '.'
import { ensureFnDir } from '../lib/utils'
import { Language, Problem } from '../types'
import BaseProject from './BaseProject'

export default class Go extends BaseProject implements Project {
  constructor(rootDir: string, libDir: string, contestId: string, problemId: string) {
    super(rootDir, libDir, contestId, problemId, Language.Go)
  }

  protected getCodeTemplate(problem: Problem): string {
    return `${problem.templates['golang']}`
  }

  protected getBuiltBaseFn(): string {
    return 'solution.go'
  }

  async build() {
    const srcFn = this.getSourceFn()
    const outFn = this.getBuiltFn()
    ensureFnDir(outFn)
    fs.copyFileSync(srcFn, outFn)
  }

  getSubmitLanguage(): string {
    return 'golang'
  }
}
