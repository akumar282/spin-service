import { chromium, Page } from 'playwright'

export async function getContent(
  handler?: (page: Page) => Promise<void>,
  proxy?: {
    server: string
    bypass?: string
    username?: string
    password?: string
  }
) {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    ...(proxy || {}),
  })
  const context = await browser.newContext({
    locale: 'en-US',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: {
      'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      'upgrade-insecure-requests': '1',
    },
  })

  const page = await context.newPage()

  if (handler) {
    await handler(page)
  }

  await browser.close()
}
