#!/usr/bin/env node
import prompts from 'prompts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import Config from './lib/config'
import CookieJar from './lib/CookieJar'
import Client from './lib/lcClient'
import { runCmd } from './lib/utils'
import Project from './project'
import TypeScript from './project/TypeScript'

const rootDir = 'contests'
const libDir = 'lib'
const config = Config.load()
const jar = CookieJar.load()
const client = new Client(config, jar)

function getProject(lang: string, contestId: string, problemId: string): Project {
  if (lang === 'typescript') return new TypeScript(rootDir, libDir, contestId, problemId)
  throw new Error(`Unsupported language: ${lang}`)
}

async function listProblems() {
  const problems = await client.listProblems(config.contestId)
  const questions: any[] = [
    {
      type: 'select',
      name: 'problemId',
      message: 'Choose a problem',
      choices: problems.map(p => ({ title: p.title, value: p.problemId }))
    }
  ]
  const resp = await prompts(questions)
  config.problemId = resp.problemId

  const problem = await client.readProblem(config.contestId, config.problemId)

  const proj = getProject(config.language, config.contestId, config.problemId)
  proj.newSolution(problem)
  await runCmd(`code ${proj.getScreenshotFn()}`)
  await runCmd(`code ${proj.getSourceFn()}`)
}

async function buildSolution() {
  const proj = getProject(config.language, config.contestId, config.problemId)
  await proj.build()
}

async function testSolution() {
  const proj = getProject(config.language, config.contestId, config.problemId)
  await client.testSolution(proj, config.contestId, config.problemId)
}

async function submitSolution() {
  const proj = getProject(config.language, config.contestId, config.problemId)
  await client.submitSolution(proj, config.contestId, config.problemId)
}

async function ensureChromePath() {
  if (config.chromePath) return

  const initial = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  const questions: any[] = [
    { type: 'text', name: 'chromePath', message: 'Google Chrome executable path:', initial },
  ]
  const resp = await prompts(questions)
  config.chromePath = resp.chromePath
}

async function ensureCookies() {
  if (jar.hasCookies()) return

  await client.login()
}

async function ensureLanguage() {
  const questions: any[] = [
    {
      type: 'select',
      name: 'language',
      message: 'Choose a language',
      choices: [
        { title: 'TypeScript', value: 'typescript' }
      ]
    }
  ]
  const resp = await prompts(questions)
  config.language = resp.language
}

async function ensureContestId() {
  if (config.contestId) return

  const questions: any[] = [
    { type: 'text', name: 'contestUrl', message: 'Contest URL:' },
  ]
  const resp = await prompts(questions)
  const contestId = resp.contestUrl.match(/\/contest\/(.*)\//)![1]
  config.contestId = contestId
}

async function main() {
  await ensureChromePath()

  const argv = await yargs(hideBin(process.argv)).argv
  const [cmd] = argv._
  if (!cmd) await ensureContestId()

  if (argv.lang) {
    config.language = String(argv.lang)
  }
  if (!config.language) await ensureLanguage()

  await ensureCookies()

  if (cmd && cmd.toString().startsWith('http')) {
    config.contestId = cmd.toString().match(/\/contest\/(.*)\//)![1]
    await listProblems()
  } else if (cmd === 'build') {
    await buildSolution()
  } else if (cmd === 'test') {
    await testSolution()
  } else if (cmd === 'submit') {
    await submitSolution()
  } else if (cmd === 'login') {
    await client.login()
  } else {
    await listProblems()
  }
}

if (require.main === module) {
  main().catch(console.error)
}
