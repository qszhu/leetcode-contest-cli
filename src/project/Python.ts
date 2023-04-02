import fs from 'fs'

import Project from '.'
import { ensureFnDir, readStringFromFile } from '../lib/utils'
import { Language, Problem } from '../types'
import BaseProject from './BaseProject'

export default class Python extends BaseProject implements Project {
  constructor(rootDir: string, libDir: string, contestId: string, problemId: string) {
    super(rootDir, libDir, contestId, problemId, Language.Python)
  }

  protected getCodeTemplate(problem: Problem): string {
    const code = `${problem.templates['python3']}`
    const problemDesc = problem.description
    const tmpl = readStringFromFile('python.tmpl.py')
    return tmpl.replace('${code}', code)
      .replace('${problemDesc}', problemDesc)
  }

  protected getBuiltBaseFn(): string {
    return 'solution.py'
  }

  async build() {
    const srcFn = this.getSourceFn()
    const outFn = this.getBuiltFn()
    ensureFnDir(outFn)
    fs.copyFileSync(srcFn, outFn)
  }

  getSubmitLanguage(): string {
    return 'python3'
  }
}
