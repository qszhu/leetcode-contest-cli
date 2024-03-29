import prompts from 'prompts'

import Config from './lib/config'
import ProjectFactory from './project/factory'

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

export async function promptStartProblem() {
  const questions: any[] = [
    {
      type: 'number',
      name: 'startProblem',
      message: 'Choose start problem (1-4)',
      validate: (value: number) => 1 <= value && value <= 4 ? true : 'Start problem should between 1 and 4'
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
