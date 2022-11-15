#!/usr/bin/env node
import { performance } from 'perf_hooks'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import Config, { KEY_CONTEST_ID, KEY_LANG, KEY_PROBLEMS, KEY_PROBLEM_ID, KEY_SITE, KEY_START_PROBLEM } from './lib/config'
import CookieJar, { KEY_COOKIES } from './lib/CookieJar'
import Client from './lib/lcClient'
import { extractContestId, runCmd, sleep, writeStringToFile } from './lib/utils'
import ProjectFactory from './project/factory'
import { promptContestUrl, promptLanguages, promptProblems, promptSites, promptStartProblem } from './prompt'

const config = Config.load()
const jar = CookieJar.load()
const client = new Client(config, jar)

const promptFunctions: Record<string, () => Promise<boolean>> = {
  [KEY_SITE]: ensureSite,
  [KEY_COOKIES]: ensureCookies,
  [KEY_CONTEST_ID]: ensureContestId,
  [KEY_PROBLEMS]: ensureProblems,
  [KEY_PROBLEM_ID]: ensureProblemId,
  [KEY_START_PROBLEM]: ensureStartProblem,
  [KEY_LANG]: ensureLanguage,
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

async function ensureSite() {
  if (config.site) return true

  const resp = await promptSites()
  if (!resp.site) return false

  config.site = resp.site
  return true
}

async function ensureContestId() {
  if (config.contestId) return true

  const resp = await promptContestUrl()
  if (resp.contestUrl) {
    const contestId = extractContestId(resp.contestUrl)
    if (contestId) {
      config.contestId = contestId
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

  return await chooseProblem()
}

async function ensureStartProblem() {
  if (config.startProblem) return true

  return await chooseStartProblem()
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
  const resp = await promptLanguages()
  if (!resp.language) return false

  config.language = resp.language
  return true
}

async function chooseStartProblem() {
  const resp = await promptStartProblem()
  if (!resp.startProblem) return false

  config.startProblem = resp.startProblem
  return true
}

async function chooseProblem() {
  if (!(await ensureConfig(KEY_PROBLEMS))) return false

  const resp = await promptProblems(config)
  if (!resp.problemId) return false

  return await openProblem(resp.problemId)
}

async function nextProblem() {
  if (!(await ensureConfig(KEY_PROBLEMS))) return false

  const problems = config.problems
  const curIdx = problems.findIndex((p: any) => p.problemId === config.problemId)
  return await openProblem(problems[(curIdx + 1) % problems.length].problemId)
}

async function openProblem(problemId: string) {
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID))) return false

  config.problemId = problemId
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
  if (!(await ensureConfig(KEY_LANG, KEY_CONTEST_ID, KEY_PROBLEMS, KEY_START_PROBLEM))) return false

  for (const { title, problemId } of config.problems) {
    console.log(`Creating project for ${title}...`)
    config.problemId = problemId
    await createProject(config.language, config.contestId, config.problemId)
  }
  const n = config.problems.length
  config.problemId = config.problems[(config.startProblem - 2 + n) % n].problemId
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
  return await client.submitSolution(proj, config.contestId, config.problemId)
}

async function initCwd() {
  writeStringToFile('.gitignore', `build/
.lccrc
.jar
`)
  writeStringToFile('python.tmpl.py', `
from typing import List

\${code}

`)
}

async function countDownToContest(contestId: string) {
  const { contest: contestInfo } = await client.getContestInfo(contestId)
  console.log(contestInfo.title)
  console.log(`开始时间：${new Date(contestInfo.start_time * 1000)}`)

  const { timestamp: serverTime } = await client.getServerTime()
  const delta = (contestInfo.start_time - serverTime) * 1000

  if (delta > 0) await countDown(delta)
}

function printRemainTime(millis: number) {
  let seconds = Math.floor(millis / 1000)
  const days = Math.floor(seconds / 60 / 60 / 24)
  seconds -= days * 60 * 60 * 24
  const hours = Math.floor(seconds / 60 / 60)
  seconds -= hours * 60 * 60
  const minutes = Math.floor(seconds / 60)
  seconds -= minutes * 60
  const text = `距离开始还有：${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`

  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
  process.stdout.write(text)
}

async function countDown(remainMillis: number) {
  const start = performance.now()
  return new Promise(async (resolve, reject) => {
    let elapsed = performance.now() - start
    while (elapsed < remainMillis) {
      printRemainTime(remainMillis - elapsed)
      await sleep(50)
      elapsed = performance.now() - start
    }
    resolve(0)
  })
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .version()
    .epilog('To upgrade, run: npm update -g leetcode-contest-cli')
    .argv

  config.verbose = argv.v ? true : false

  const [cmd] = argv._

  if (!(await ensureConfig(KEY_SITE, KEY_COOKIES))) return
  console.log('Current user:', jar.userName)

  if (!cmd) {
    await createAll()
    await nextProblem()
  } else if (cmd.toString().startsWith('http')) {
    config.contestId = extractContestId(cmd.toString())
    config.problems = undefined
    await countDownToContest(config.contestId)
    await createAll()
    await nextProblem()
  } else if (cmd === 'test') {
    await buildSolution()
    await testSolution()
  } else if (cmd === 'submit') {
    await buildSolution()
    const res = await submitSolution()
    if (res) await nextProblem()
  } else if (cmd === 'login') {
    await client.login()
  } else if (cmd === 'init') {
    await initCwd()
  } else if (cmd === 'lang') {
    await chooseLanguage()
  } else if (cmd === 'next') {
    await nextProblem()
  } else if (cmd === 'list') {
    await chooseProblem()
  } else console.error(`Unknown command: ${cmd}`)
}

if (require.main === module) {
  main().catch(console.error)
}
