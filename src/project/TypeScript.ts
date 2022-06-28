import Project from '.'
import { Language, Problem } from '../types'
import BaseProject from './BaseProject'

const TARGET = 'node16.13.2'

export default class TypeScript extends BaseProject implements Project {
  constructor(rootDir: string, libDir: string, contestId: string, problemId: string) {
    super(rootDir, libDir, contestId, problemId, Language.TypeScript)
  }

  protected getCodeTemplate(problem: Problem): string {
    return `/*
${problem.content}
*/

export ${problem.templates['typescript']}
`
  }

  protected getBuiltBaseFn(): string {
    return 'solution.js'
  }

  protected getBuildCmd(srcFn: string, outFn: string): string {
    return `esbuild ${srcFn} --bundle --minify-syntax --platform=node --target=${TARGET} --outfile=${outFn}`
  }
}
