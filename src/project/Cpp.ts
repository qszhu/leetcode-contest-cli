import Project from '.'
import { ensureFnDir } from '../lib/utils'
import { Language, Problem } from '../types'
import BaseProject from './BaseProject'

export default class Cpp extends BaseProject implements Project {
  constructor(rootDir: string, libDir: string, contestId: string, problemId: string) {
    super(rootDir, libDir, contestId, problemId, Language.Cpp)
  }

  protected getCodeTemplate(problem: Problem): string {
    return `${problem.templates['cpp']}`
  }

  protected getBuiltBaseFn(): string {
    return 'solution.cpp'
  }

  protected getBuildCmd(srcFn: string, outFn: string): string {
    ensureFnDir(outFn)
    return `cp ${srcFn} ${outFn}`
  }

  getSubmitLanguage(): string {
    return 'cpp'
  }
}
