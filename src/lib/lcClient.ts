import axios from "axios"
import fs from 'fs'
import { convert } from "html-to-text"

import Project from "../project"
import { Problem } from "../types"
import Config from "./config"
import CookieJar from "./CookieJar"
import { newPage } from "./crawler"
import { sleep } from "./utils"

const HOST = 'https://leetcode.cn'

function extractOutput(content: string) {
  return content.split('\n')
    .filter(line => line.startsWith('输出：'))
    .map(line => line.match(/^输出：(.+)$/)![1])
    .join('\n')
}

export default class Client {
  constructor(private config: Config, private cookieJar: CookieJar) { }

  async login() {
    const url = `${HOST}/accounts/login/`

    await newPage(url, async page => {
      await page.waitForNavigation({ timeout: 5 * 60 * 1000 })

      // save cookies
      this.cookieJar.cookies = await page.cookies()
    }, { executablePath: this.config.chromePath, headless: false })
  }

  async listProblems(contestId: string) {
    const url = `${HOST}/contest/${contestId}/`

    const problemLinkSel = 'ul.contest-question-list a'

    let problems: any[] = []

    await newPage(url, async page => {
      await page.waitForSelector(problemLinkSel)

      problems = await page.evaluate(({ problemLinkSel }) => {
        const links: any[] = Array.from(document.querySelectorAll(problemLinkSel))
        const res = links.map(link => ({ href: link.href, text: link.innerText }))
        return res
      }, { problemLinkSel })

      this.cookieJar.cookies = await page.cookies()
    }, { cookies: this.cookieJar.cookies, executablePath: this.config.chromePath })

    return problems.map(p => {
      const { href, text } = p
      let id = href.substring(href.indexOf('/problems/') + 10)
      if (id[id.length - 1] === '/') id = id.substring(0, id.length - 1)
      return { problemId: id, title: text }
    })
  }

  async readProblem(contestId: string, problemId: string): Promise<Problem> {
    const url = `${HOST}/contest/${contestId}/problems/${problemId}/`

    let pageData: any
    let screenShot: any

    await newPage(url, async page => {
      pageData = await page.evaluate(() => eval('pageData'))

      screenShot = await page.screenshot({ fullPage: true })
      this.cookieJar.cookies = await page.cookies()
    }, { cookies: this.cookieJar.cookies, executablePath: this.config.chromePath })

    const {
      questionId: rawId,
      questionContent,
      questionExampleTestcases,
      codeDefinition,
    } = pageData

    const content = convert(questionContent, {
      wordwrap: 100
    })
    const templates = codeDefinition.reduce((acc: any, val: any) => {
      acc[val.value] = val.defaultCode
      return acc
    }, {})

    return {
      rawId,
      contestId,
      problemId,
      content,
      input: questionExampleTestcases,
      output: extractOutput(content),
      templates,
      screenShot
    }
  }

  async testSolution(project: Project, contestId: string, problemId: string) {
    const rawId = fs.readFileSync(project.getIdFn(), 'utf-8')
    const input = fs.readFileSync(project.getInputFn(), 'utf-8')
    const output = fs.readFileSync(project.getOutputFn(), 'utf-8')
    const src = fs.readFileSync(project.getBuiltFn(), 'utf-8')
    const data = {
      question_id: rawId,
      data_input: input,
      lang: project.getSubmitLanguage(),
      typed_code: src,
      test_mode: false,
      judge_type: 'large'
    }
    const url = `${HOST}/contest/api/${contestId}/problems/${problemId}/interpret_solution/`
    const referer = `${HOST}/contest/${contestId}/problems/${problemId}/`
    const cookies = this.cookieJar.cookiesHeader
    const opts = {
      url,
      method: 'post',
      headers: { Cookie: cookies, Referer: referer },
      data
    }

    const { data: { interpret_id } } = await axios.request(opts)
    const res: any = await this.waitResult(interpret_id, contestId, problemId)

    const { status_msg, code_answer, code_output, full_compile_error, full_runtime_error } = res
    console.log(status_msg)

    const codeOutput = code_output.join('\n')
    if (codeOutput) {
      console.log('Code output:')
      console.log(codeOutput)
    }

    if (full_compile_error) {
      console.log(full_compile_error)
      return
    }

    if (full_runtime_error) {
      console.log(full_runtime_error.split('\n').reverse().join('\n'))
      return
    }

    const actualOutput = code_answer.join('\n')
    if (actualOutput === output) {
      console.log('SUCCESS')
      return
    }

    console.log('expected:')
    console.log(output)
    console.log('got:')
    console.log(actualOutput)
  }

  private async waitResult(submissionId: string, contestId: string, problemId: string) {
    let res: any
    while (true) {
      res = await this.getSubmissionResult(submissionId, contestId, problemId)
      if (res.state === 'SUCCESS') break

      console.log(res.state)
      await sleep(1000)
    }
    return res
  }

  private async getSubmissionResult(submissionId: string, contestId: string, problemId: string) {
    const url = `${HOST}/submissions/detail/${submissionId}/check/`
    const referer = `${HOST}/contest/${contestId}/problems/${problemId}/`
    const cookies = this.cookieJar.cookiesHeader
    const opts = {
      url,
      method: 'get',
      headers: {
        Cookie: cookies,
        Referer: referer,
      }
    }
    const res = await axios.request(opts)
    return res.data
  }

  async submitSolution(project: Project, contestId: string, problemId: string) {
    const rawId = fs.readFileSync(project.getIdFn(), 'utf-8')
    const src = fs.readFileSync(project.getBuiltFn(), 'utf-8')
    const data = {
      question_id: rawId,
      lang: project.getSubmitLanguage(),
      typed_code: src,
      test_mode: false,
      judge_type: 'large'
    }
    const url = `${HOST}/contest/api/${contestId}/problems/${problemId}/submit/`
    const referer = `${HOST}/contest/${contestId}/problems/${problemId}/`
    const cookies = this.cookieJar.cookiesHeader
    const opts = {
      url,
      method: 'post',
      headers: { Cookie: cookies, Referer: referer },
      data
    }

    const { data: { submission_id } } = await axios.request(opts)
    const res: any = await this.waitResult(submission_id, contestId, problemId)

    const { status_msg, full_runtime_error } = res
    console.log(status_msg)

    if (full_runtime_error) {
      console.log(full_runtime_error.split('\n').reverse().join('\n'))
      return
    }

    if (status_msg === 'Accepted') {
      const { status_runtime, status_memory } = res
      console.log('runtime:', status_runtime)
      console.log('memory:', status_memory)
      return
    }

    const { code_output, last_testcase, expected_output, total_correct, total_testcases } = res
    console.log(`${total_correct}/${total_testcases}`)
    console.log('Last testcase:')
    console.log(last_testcase)
    console.log('Expected:')
    console.log(expected_output)
    console.log('Actual:')
    console.log(code_output)
  }
}
