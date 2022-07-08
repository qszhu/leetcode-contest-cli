import prompts from 'prompts'

import Config from './lib/config'
import ProjectFactory from './project/factory'

export async function promptChromePath() {
  const initial = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  const questions: any[] = [
    { type: 'text', name: 'chromePath', message: 'Google Chrome executable path:', initial },
  ]
  return prompts(questions)
}

export async function promptSites() {
  const questions: any[] = [
    {
      type: 'select',
      name: 'site',
      message: 'Choose a site',
      choices: [
        { title: '力扣 (leetcode.cn)', value: 'https://leetcode.cn' },
        { title: 'LeetCode (leetcode.com)', value: 'https://leetcode.com' }
      ]
    }
  ]
  return prompts(questions)
}

export async function promptContestUrl() {
  const questions: any[] = [
    { type: 'text', name: 'contestUrl', message: 'Contest URL:' },
  ]
  return prompts(questions)
}

export async function promptLanguages() {
  const questions: any[] = [
    {
      type: 'select',
      name: 'language',
      message: 'Choose a language',
      choices: ProjectFactory.supportedLanguages()
        .map(({ name, value }) => ({ title: name, value }))
    }
  ]
  return prompts(questions)
}

export async function promptProblems(config: Config) {
  const questions: any[] = [
    {
      type: 'select',
      name: 'problemId',
      message: 'Choose a problem',
      choices: config.problems.map((p: any) => ({ title: p.title, value: p.problemId }))
    }
  ]
  return prompts(questions)
}
