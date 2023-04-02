export enum Language {
  Python = 'py',
  Java = 'java',
  Cpp = 'cpp',
  JavaScript = 'js',
  Go = 'go',
  Rust = 'rs',
  Kotlin = 'kt',
  Dart = 'dart',
  Haskell = 'hs',
  TypeScript = 'ts',
}

export type Problem = {
  rawId: string
  contestId: string
  problemId: string
  input: string
  output: string
  templates: Record<string, string>
  screenShot: Buffer
  description: string
}

export type PptrOptions = {
  headless?: boolean
  keepOpen?: boolean
  slowMo?: number
  devtools?: boolean
  debug?: boolean
  cookies?: any[]
  proxy?: string
}
