import puppeteer from 'puppeteer-core'
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
  if (opts.executablePath) launchOpts.executablePath = opts.executablePath
  if (opts.proxy) launchOpts.args.push(`--proxy-server=${opts.proxy}`)

  const browser = await puppeteer.launch(launchOpts)
  const page = await browser.newPage()
  await page.setViewport({ width: WIDTH, height: HEIGHT })

  if (opts.cookies) await page.setCookie(...opts.cookies)
  await page.goto(url, { waitUntil: 'networkidle2' })

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
}
