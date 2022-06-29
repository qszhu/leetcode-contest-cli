#!/usr/bin/env node
import fs from 'fs'
import prompts from 'prompts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import Config, { KEY_CHROME_PATH, KEY_CONTEST_ID, KEY_LANG, KEY_PROBLEMS, KEY_PROBLEM_ID } from './lib/config'
import CookieJar, { KEY_COOKIES } from './lib/CookieJar'
import Client from './lib/lcClient'
import { runCmd, writeStringToFile } from './lib/utils'
import Project from './project'
import Cpp from './project/Cpp'
import Python from './project/Python'
import TypeScript from './project/TypeScript'

const rootDir = 'contests'
const libDir = 'lib'
const config = Config.load()
const jar = CookieJar.load()
const client = new Client(config, jar)

async function chooseLanguage() {
  const questions: any[] = [
    {
      type: 'select',
      name: 'language',
      message: 'Choose a language',
      choices: [
        { title: 'TypeScript', value: 'typescript' },
        { title: 'Python', value: 'python' },
        { title: 'C++', value: 'cpp' },
      ]
    }
  ]
  const resp = await prompts(questions)
  if (!resp.language) return false

  config.language = resp.language
  return true
}

function getProject(lang: string, contestId: string, problemId: string): Project {
  if (lang === 'typescript') return new TypeScript(rootDir, libDir, contestId, problemId)
  if (lang === 'python') return new Python(rootDir, libDir, contestId, problemId)
  if (lang === 'cpp') return new Cpp(rootDir, libDir, contestId, problemId)
  throw new Error(`Unsupported language: ${lang}`)
}

const promptFunctions: Record<string, () => Promise<boolean>> = {}
promptFunctions[KEY_CHROME_PATH] = ensureChromePath
promptFunctions[KEY_CONTEST_ID] = ensureContestId
promptFunctions[KEY_PROBLEMS] = ensureProblems
promptFunctions[KEY_PROBLEM_ID] = ensureProblemId
promptFunctions[KEY_LANG] = ensureLanguage
promptFunctions[KEY_COOKIES] = ensureCookies

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
  if (!resp.chromePath || !fs.existsSync(resp.chromePath)) return false

  config.chromePath = resp.chromePath
  return true
}

async function ensureContestId() {
  if (config.contestId) return true

  const questions: any[] = [
    { type: 'text', name: 'contestUrl', message: 'Contest URL:' },
  ]
  const resp = await prompts(questions)
  if (!resp.contestUrl) return false

  const contestId = resp.contestUrl.match(/\/contest\/(.*)\//)![1]
  config.contestId = contestId
  return true
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
  return jar.hasCookies()
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
  const proj = getProject(lang, contestId, problemId)
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

  const proj = getProject(config.language, config.contestId, config.problemId)
  await proj.build()
}

async function testSolution() {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEM_ID))) return false

  const proj = getProject(config.language, config.contestId, config.problemId)
  await client.testSolution(proj, config.contestId, config.problemId)
}

async function submitSolution() {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEM_ID))) return false

  const proj = getProject(config.language, config.contestId, config.problemId)
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
  const [cmd] = argv._

  await ensureConfig(KEY_CHROME_PATH, KEY_COOKIES)

  if (cmd && cmd.toString().startsWith('http')) {
    config.contestId = cmd.toString().match(/\/contest\/(.*)\//)![1]
    config.problems = undefined
    await createAll()
    await selectProblem()
  } else if (cmd === 'build') {
    await buildSolution()
  } else if (cmd === 'test') {
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
  } else {
    await createAll()
    await selectProblem()
  }
}

if (require.main === module) {
  main().catch(console.error)
}
