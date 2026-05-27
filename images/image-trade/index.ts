import { chromium } from 'playwright'
import { PostInfo } from 'shared/src/types'
import { getEnv, mergeDiscogsData, submitItems } from 'shared/src/functions'
import { RoughTradeSearchResponse } from './types'

const pushPostsQueue: Partial<PostInfo>[] = []

async function getCertainRequest(url: string): Promise<RoughTradeSearchResponse | null> {

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })


  try {
    const context = await browser.newContext({
      locale: 'en-US',
      serviceWorkers: 'block',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: {
        'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    })

    const page = await context.newPage()

    page.setDefaultTimeout(45000)
    page.setDefaultNavigationTimeout(60000)

    const queryResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('algolia') &&
        response.url().includes('/1/indexes/*/queries'),
      { timeout: 60000 }
    )

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

    const response = await queryResponsePromise

    const contentType = response.headers()['content-type'] ?? ''

    return contentType.includes('application/json')
      ? await response.json()
      : null

  } catch {
    return null
  } finally {
    await browser.close()
  }
}

function parseResult(data: RoughTradeSearchResponse | null) {
  const list = data?.results[0].hits
  if (list) {
    for (const items of list) {
      const mappedItem: Partial<PostInfo> = {
        artist: items.artists[0].label,
        album: items.title,
        thumbnail: items.image,
        postId: items.id.toString(),
        preorder: items.meta.custom.is_pre_order !== 'false',
        format: items.meta.custom.format,
        region: items.meta.custom.manual_regional_availability?.toString(),
        color: items.meta.custom.colour_swatch,
        price: items.price,
        searchString: items.title + ' ' + items.artists[0].label,
        content: `https://www.roughtrade.com/en-us/search?q=${items.id.toString()}`
      }
      pushPostsQueue.push(mappedItem)
    }
  }
}



async function main() {
  try {
    const endpointUrl = getEnv('API_URL')
    const result = await getCertainRequest(
      'https://www.roughtrade.com/en-us/collection/out-this-week'
    )
    parseResult(result)
    await mergeDiscogsData(pushPostsQueue)
    console.dir(pushPostsQueue, { depth: null })
    await submitItems(pushPostsQueue, endpointUrl)
  } catch (e) {
    console.error('[MAIN]: Execution failed with message ' + e)
  }
}

main()
  .then(() => {
    const time = new Date().toString()
    console.info('Run complete: ' + time)
  })
  .catch((error) => {
    console.error(error)
  })
