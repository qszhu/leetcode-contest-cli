import Project from '.'
import { runCmd } from '../lib/utils'
import { Language, Problem } from '../types'
import BaseProject from './BaseProject'

const TARGET = 'node16.13.2'

export default class TypeScript extends BaseProject implements Project {
  constructor(rootDir: string, libDir: string, contestId: string, problemId: string) {
    super(rootDir, libDir, contestId, problemId, Language.TypeScript)
  }

  protected getCodeTemplate(problem: Problem): string {
    return `export ${problem.templates['typescript']}`
  }

  protected getBuiltBaseFn(): string {
    return 'solution.js'
  }

  async build() {
    const srcFn = this.getSourceFn()
    const outFn = this.getBuiltFn()
    const cmd = `esbuild ${srcFn} --bundle --minify-syntax --platform=node --target=${TARGET} --outfile=${outFn}`

    const { err, stderr } = await runCmd(cmd)
    if (err) throw new Error(stderr)

    console.error(stderr)
  }

  getSubmitLanguage(): string {
    return 'javascript'
  }
}
