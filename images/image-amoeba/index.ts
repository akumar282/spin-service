import axios from 'axios'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { chromium } from 'playwright'
import { PostInfo } from 'shared/src/types'
import { ulid } from 'ulid'
import { getEnv, mergeDiscogsData, submitItems } from 'shared/src/functions'

let unparsedData: HTMLElement[] = []
const parsedData: Partial<PostInfo>[] = []

async function getContent() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
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

  await page.goto('https://www.amoeba.com', { waitUntil: 'domcontentloaded' })

  const result = await page.evaluate(async () => {
    const res = await fetch('/ajax/new_releases.php?show=50&page=1')
    return await res.json()
  })

  const parsed = parseHTML(result.data)
  unparsedData = [...parsed.querySelectorAll('tr')]

  await browser.close()
}

function getMediaType(productInformation: string | undefined) {
  if (!productInformation) {
    return ''
  }
  if (productInformation.includes('LP') || productInformation.includes('EP')) {
    return 'Vinyl'
  } else if (productInformation.includes('CD')) {
    return 'CD'
  } else if (productInformation.includes('Cassette')) {
    return 'Cassette'
  } else if (productInformation.includes('Figure')) {
    return 'Figure'
  }
  return 'Vinyl'
}

function extractColor(str: string | undefined): string | null {
  if (!str) {
    return 'Black'
  }
  const match = str.match(/\[([^\]]+)\]/)?.[1]
  return match?.replace(/ vinyl/i, '').trim() || 'Black'
}

function extractData(unparsedData: HTMLElement[]) {
  for (const item of unparsedData) {
    const album = item.querySelector('td.track-title-cell')?.querySelector('a.light-gray')?.text
    const artist = item.querySelectorAll('td')[1]?.querySelector('a')?.text.trim()
    const yesterday = new Date(Date.now())

    parsedData.push({
      album: album?.split('(')[0].split('[')[0].trim(),
      content:
        'https://amoeba.com' +
        item
          .querySelector('td.track-title-cell')
          ?.querySelector('a.light-gray')
          ?.getAttribute('href'),
      thumbnail: item
        .querySelector('.search-thumb img')
        ?.getAttribute('src')
        ?.replace(/\/crop\/\d+\/\d+\//, '/crop/500/500/'),
      artist,
      postId: item
        .querySelector('td.track-title-cell')
        ?.querySelector('a.light-gray')
        ?.getAttribute('href')
        ?.match(/\/albums\/(\d+)\//)?.[1],
      postTitle: album,
      media: getMediaType(album),
      color: extractColor(album),
      customTitle: artist + ' ' + album?.split('(')[0].split('[')[0].trim(),
      expires: Math.floor(
        (new Date().getTime() + 20 * 24 * 60 * 60 * 1000) / 1000
      ),
      dateGroup: `DATE#${(yesterday.getMonth() + 1).toString()}`,
      created_time: new Date().toISOString(),
      source: 'Amoeba',
      secondaryId: ulid(),
      searchString: artist + ' ' + album?.split('(')[0].split('[')[0].trim(),
      link:
        'https://amoeba.com' +
        item
          .querySelector('td.track-title-cell')
          ?.querySelector('a.light-gray')
          ?.getAttribute('href'),
    })
  }
}



async function main() {
  try {
    await getContent()
    extractData(unparsedData)
    await mergeDiscogsData(parsedData)
    await submitItems(parsedData, getEnv('API_URL'))
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
