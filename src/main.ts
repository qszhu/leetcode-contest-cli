#!/usr/bin/env node
import fs from 'fs'
import prompts from 'prompts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import Config, { KEY_CHROME_PATH, KEY_CONTEST_ID, KEY_LANG, KEY_PROBLEMS, KEY_PROBLEM_ID } from './lib/config'
import CookieJar, { KEY_COOKIES } from './lib/CookieJar'
import Client from './lib/lcClient'
import { runCmd, writeStringToFile } from './lib/utils'
import ProjectFactory from './project/factory'

const config = Config.load()
const jar = CookieJar.load()
const client = new Client(config, jar)

const promptFunctions: Record<string, () => Promise<boolean>> = {
  [KEY_CHROME_PATH]: ensureChromePath,
  [KEY_CONTEST_ID]: ensureContestId,
  [KEY_PROBLEMS]: ensureProblems,
  [KEY_PROBLEM_ID]: ensureProblemId,
  [KEY_LANG]: ensureLanguage,
  [KEY_COOKIES]: ensureCookies
}

async function ensureConfig(...keys: string[]) {
  for (const key of keys) {
    const fn = promptFunctions[key]
    if (fn) {
      const res = await fn()
      if (!res) return false
    }
    else throw new Error(`Unknown key: ${key}`)
  }
  return true
}

async function ensureChromePath() {
  if (config.chromePath) return true

  const initial = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  const questions: any[] = [
    { type: 'text', name: 'chromePath', message: 'Google Chrome executable path:', initial },
  ]
  const resp = await prompts(questions)
  if (!resp.chromePath || !fs.existsSync(resp.chromePath)) {
    console.log('Invalid path.')
    return false
  }

  config.chromePath = resp.chromePath
  return true
}

async function ensureContestId() {
  if (config.contestId) return true

  const questions: any[] = [
    { type: 'text', name: 'contestUrl', message: 'Contest URL:' },
  ]
  const resp = await prompts(questions)

  if (resp.contestUrl) {
    const match = resp.contestUrl.match(/\/contest\/(.*)\//)
    if (match) {
      config.contestId = match[1]
      return true
    }
  }

  console.log('Invalid contest url.')
  return false
}

async function ensureProblems() {
  if (config.problems) return true

  if (!(await ensureConfig(KEY_CONTEST_ID))) return false

  config.problems = await client.listProblems(config.contestId)
  return true
}

async function ensureProblemId() {
  if (config.problemId) return true

  return await selectProblem()
}

async function ensureLanguage() {
  if (config.language) return true

  return await chooseLanguage()
}

async function ensureCookies() {
  if (jar.hasCookies()) return true

  await client.login()

  const success = jar.hasCookies()

  if (success) console.log('Login successful.')
  else console.log('Login failed.')

  return success
}

async function chooseLanguage() {
  const questions: any[] = [
    {
      type: 'select',
      name: 'language',
      message: 'Choose a language',
      choices: ProjectFactory.supportedLanguages()
        .map(({ name, value }) => ({ title: name, value }))
    }
  ]
  const resp = await prompts(questions)
  if (!resp.language) return false

  config.language = resp.language
  return true
}

async function selectProblem() {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEMS))) return false

  const questions: any[] = [
    {
      type: 'select',
      name: 'problemId',
      message: 'Choose a problem',
      choices: config.problems.map((p: any) => ({ title: p.title, value: p.problemId }))
    }
  ]
  const resp = await prompts(questions)
  if (!resp.problemId) return false

  config.problemId = resp.problemId

  const proj = await createProject(config.language, config.contestId, config.problemId)
  await runCmd(`code ${proj.getScreenshotFn()}`)
  await runCmd(`code ${proj.getSourceFn()}`)
  return true
}

async function createProject(lang: string, contestId: string, problemId: string) {
  const proj = ProjectFactory.getProject(lang, contestId, problemId)
  if (!proj.hasSolution()) {
    const problem = await client.readProblem(contestId, problemId)
    proj.newSolution(problem)
  }
  return proj
}

async function createAll() {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEMS))) return false

  for (const { title, problemId } of config.problems) {
    console.log(`Creating project for ${title}...`)
    config.problemId = problemId
    await createProject(config.language, config.contestId, config.problemId)
  }
}

async function buildSolution() {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEM_ID))) return false

  const proj = ProjectFactory.getProject(config.language, config.contestId, config.problemId)
  await proj.build()
}

async function testSolution() {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEM_ID))) return false

  const proj = ProjectFactory.getProject(config.language, config.contestId, config.problemId)
  await client.testSolution(proj, config.contestId, config.problemId)
}

async function submitSolution() {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEM_ID))) return false

  const proj = ProjectFactory.getProject(config.language, config.contestId, config.problemId)
  await client.submitSolution(proj, config.contestId, config.problemId)
}

async function initCwd() {
  writeStringToFile('.gitignore', `build/
.lccrc
.jar
`)
}

async function main() {
  const argv = await yargs(hideBin(process.argv)).version().argv

  config.verbose = argv.v ? true : false

  const [cmd] = argv._

  if (!(await ensureConfig(KEY_CHROME_PATH, KEY_COOKIES))) return

  if (!cmd) {
    await createAll()
    await selectProblem()
  } else if (cmd.toString().startsWith('http')) {
    config.contestId = cmd.toString().match(/\/contest\/(.*)\//)![1]
    config.problems = undefined
    await createAll()
    await selectProblem()
  } else if (cmd === 'test') {
    await buildSolution()
    await testSolution()
  } else if (cmd === 'submit') {
    await submitSolution()
  } else if (cmd === 'login') {
    await client.login()
  } else if (cmd === 'init') {
    await initCwd()
  } else if (cmd === 'lang') {
    await chooseLanguage()
  } else if (cmd === 'list') {
    await selectProblem()
  } else console.error(`Unknown command: ${cmd}`)
}

if (require.main === module) {
  main().catch(console.error)
}
