import fs from 'fs'
import path from 'path'

const CONFIG_FN = '.lccrc'
const KEY_CHROME_PATH = 'chromePath'
const KEY_CONTEST_ID = 'contestId'
const KEY_PROBLEM_ID = 'problemId'
const KEY_LANG = 'language'

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

  get language() {
    return this.data[KEY_LANG]
  }

  set language(lang: string) {
    this.data[KEY_LANG] = lang
    this.save()
  }
}
