import fs from 'fs'
import path from 'path'

const CONFIG_FN = '.lccrc'
export const KEY_CHROME_PATH = 'chromePath'
export const KEY_CONTEST_ID = 'contestId'
export const KEY_PROBLEM_ID = 'problemId'
export const KEY_PROBLEMS = 'problems'
export const KEY_LANG = 'language'
const KEY_VERBOSE = 'verbose'

function getConfigFn() {
  return path.join(process.cwd(), CONFIG_FN)
}

export default class Config {
  static load() {
    const configFn = getConfigFn()
    if (fs.existsSync(configFn)) {
      const data = fs.readFileSync(configFn, 'utf-8')
      return new Config(JSON.parse(data))
    }
    return new Config()
  }

  private constructor(private data: Record<string, any> = {}) { }

  private save() {
    fs.writeFileSync(getConfigFn(), JSON.stringify(this.data, null, 2))
  }

  get chromePath() {
    return this.data[KEY_CHROME_PATH]
  }

  set chromePath(path: string) {
    this.data[KEY_CHROME_PATH] = path
    this.save()
  }

  get contestId() {
    return this.data[KEY_CONTEST_ID]
  }

  set contestId(contestId: string) {
    this.data[KEY_CONTEST_ID] = contestId
    this.save()
  }

  get problemId() {
    return this.data[KEY_PROBLEM_ID]
  }

  set problemId(problemId: string) {
    this.data[KEY_PROBLEM_ID] = problemId
    this.save()
  }

  get problems() {
    return this.data[KEY_PROBLEMS]
  }

  set problems(problems: any) {
    this.data[KEY_PROBLEMS] = problems
    this.save()
  }

  get language() {
    return this.data[KEY_LANG]
  }

  set language(lang: string) {
    this.data[KEY_LANG] = lang
    this.save()
  }

  get verbose() {
    return this.data[KEY_VERBOSE] || false
  }

  set verbose(v: boolean) {
    this.data[KEY_VERBOSE] = v
    this.save()
  }
}
