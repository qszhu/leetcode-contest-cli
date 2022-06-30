import fs from 'fs'

import Project from '.'
import { ensureFnDir } from '../lib/utils'
import { Language, Problem } from '../types'
import BaseProject from './BaseProject'

export default class Java extends BaseProject implements Project {
  constructor(rootDir: string, libDir: string, contestId: string, problemId: string) {
    super(rootDir, libDir, contestId, problemId, Language.Java)
  }

  protected getCodeTemplate(problem: Problem): string {
    return `${problem.templates['java']}`
  }

  protected getBuiltBaseFn(): string {
    return 'solution.java'
  }

  async build() {
    const srcFn = this.getSourceFn()
    const outFn = this.getBuiltFn()
    ensureFnDir(outFn)
    fs.copyFileSync(srcFn, outFn)
  }

  getSubmitLanguage(): string {
    return 'java'
  }
}
