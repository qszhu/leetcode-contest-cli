import fs from 'fs'
import path from 'path'

const COOKIES_FN = '.jar'
export const KEY_COOKIES = 'cookies'

function getCookiesFn() {
  return path.join(process.cwd(), COOKIES_FN)
}

export default class CookieJar {
  static load() {
    const cookiesFn = getCookiesFn()
    if (fs.existsSync(cookiesFn)) {
      const data = fs.readFileSync(cookiesFn, 'utf-8')
      return new CookieJar(JSON.parse(data))
    }
    return new CookieJar()
  }

  private constructor(private data: Record<string, any> = {}) { }

  private save() {
    fs.writeFileSync(getCookiesFn(), JSON.stringify(this.data))
  }

  hasCookies() {
    const cookies = this.data[KEY_COOKIES]
    return cookies && cookies.some((cookie: any) => cookie.name === 'LEETCODE_SESSION')
  }

  get cookies() {
    return this.data[KEY_COOKIES]
  }

  get cookiesHeader() {
    return this.data[KEY_COOKIES].map((cookie: any) =>
      `${cookie.name}=${cookie.value}`).join('; ')
  }

  set cookies(cookies: any) {
    this.data[KEY_COOKIES] = cookies
    this.save()
  }
}
