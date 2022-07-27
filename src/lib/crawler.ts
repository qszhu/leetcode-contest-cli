import puppeteer from 'puppeteer'
import { PptrOptions } from '../types'

const WIDTH = 1024, HEIGHT = 768

const defaultOpts = {
  headless: true,
  keepOpen: false,
  slowMo: 0,
  devTools: false,
  debug: false
}

export async function newPage(
  url: string,
  cb: (page: puppeteer.Page, browser: puppeteer.Browser) => Promise<void>,
  opts: PptrOptions = {}
) {
  let start = new Date().getTime()

  if (opts.debug) {
    opts.headless = false
    opts.keepOpen = true
    opts.slowMo = 250
    opts.devtools = true
  }
  opts = Object.assign({}, defaultOpts, opts)
  let launchOpts: any = {
    headless: opts.headless,
    slowMo: opts.slowMo,
    args: [`--window-size=${WIDTH},${HEIGHT}`],
    devtools: opts.devtools
  }
  if (opts.proxy) launchOpts.args.push(`--proxy-server=${opts.proxy}`)

  const browser = await puppeteer.launch(launchOpts)
  const page = await browser.newPage()
  await page.setViewport({ width: WIDTH, height: HEIGHT })

  if (opts.cookies) await page.setCookie(...opts.cookies)
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  // crucial: remove webdriver property
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    })
  })

  if (opts.debug) {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  }

  await cb(page, browser)

  if (!opts.keepOpen) {
    await browser.close()
  }

  console.log(`- ${((new Date().getTime() - start) / 1000).toFixed(3)}s`)
}
