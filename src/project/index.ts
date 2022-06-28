import { Problem } from '../types'

export default interface Project {
  getIdFn(): string
  getInputFn(): string
  getOutputFn(): string
  getScreenshotFn(): string
  getSourceFn(): string
  getBuiltFn(): string
  hasSolution(): boolean
  newSolution(problem: Problem): void
  build(): Promise<void>
  getSubmitLanguage(): string
}
