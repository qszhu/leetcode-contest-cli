import fs from 'fs'
import path from 'path'

const CONFIG_FN = '.lccrc'
export const KEY_CONTEST_ID = 'contestId'
export const KEY_PROBLEM_ID = 'problemId'
export const KEY_PROBLEMS = 'problems'
export const KEY_LANG = 'language'
export const KEY_SITE = 'site'
export const KEY_START_PROBLEM = 'startProblem'
const KEY_VERBOSE = 'verbose'
const KEY_PROXY = 'proxy'

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

  get contestId() {
    return this.data[KEY_CONTEST_ID]
  }

  set contestId(contestId: any) {
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

  get site() {
    return this.data[KEY_SITE]
  }

  set site(site: string) {
    this.data[KEY_SITE] = site
    this.save()
  }

  get startProblem() {
    return this.data[KEY_START_PROBLEM]
  }

  set startProblem(start: number) {
    this.data[KEY_START_PROBLEM] = start
    this.save()
  }

  get verbose() {
    return this.data[KEY_VERBOSE] || false
  }

  set verbose(v: boolean) {
    this.data[KEY_VERBOSE] = v
    this.save()
  }

  get proxy() {
    return this.data[KEY_PROXY]
  }

  set proxy(proxy: string) {
    this.data[KEY_PROXY] = proxy
    this.save()
  }
}
