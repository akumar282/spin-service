import { chromium } from 'playwright'
import { PostInfo } from 'shared/src/types'
import { getEnv, mergeDiscogsData, submitItems } from 'shared/src/functions'
import { RoughTradeSearchResponse } from './types'
import { ulid } from 'ulid'

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
        response.url().includes('/api/algolia/search') &&
        response.request().method() === 'POST',
      { timeout: 60000 }
    )

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

    const response = await queryResponsePromise

    const contentType = response.headers()['content-type'] ?? ''
    const requestPostData = response.request().postData()

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
      const yesterday = new Date(Date.now())
      const artist = items.taxonomy.artists[0]?.label ?? items.product.artist_primary
      const album = items.product.title
      const market = items.markets.north_america
      const availableRegions = Object.entries(items.markets)
        .filter(([, marketInfo]) => marketInfo.available)
        .map(([region]) => region)

      const mappedItem: Partial<PostInfo> = {
        artist,
        album,
        thumbnail: items.variant.image ?? items.product.image,
        postId: items.product.id,
        preorder: items.availability.status === 'pre_order',
        format: items.attributes.format ?? undefined,
        region: availableRegions.toString(),
        color: items.attributes.colour_swatch ?? items.attributes.colour_group ?? undefined,
        price: market.price ?? undefined,
        searchString: album + ' ' + artist,
        content: `https://www.roughtrade.com/en-us/search?q=${items.product.id}`,
        dateGroup: `DATE#${(yesterday.getMonth() + 1).toString()}`,
        created_time: new Date().toISOString(),
        source: 'Rough Trade',
        secondaryId: ulid(),
        media: 'Vinyl',
        expires: Math.floor(
          (new Date().getTime() + 20 * 24 * 60 * 60 * 1000) / 1000
        ),
        customTitle: album + ' ' + artist,
        title: album + ' ' + artist,
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
