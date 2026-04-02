import axios from 'axios'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { getEnv, mergeDiscogsData, PostInfo, submitItems } from 'shared'
import { ulid } from 'ulid'
import crypto from 'node:crypto'
import { HttpsProxyAgent } from 'https-proxy-agent'

const itemsList: Partial<PostInfo>[] = []

const SOURCE_URL =
  'https://getondown.com/collections/new-arrivals?sort_by=created-descending&page='

const ProxyIp = getEnv('PROXY_IP')

const proxyAgent = new HttpsProxyAgent(ProxyIp, {
  headers: {
    'x-auth-token': getEnv('PROXY_AUTH_TOKEN'),
  },
})

const getPaginatedUrl = (page: number) => {
  return SOURCE_URL + page.toString()
}

async function getHtml(
  endpoint: string,
  headers?: object
): Promise<HTMLElement | null> {
  try {
    const result = await axios.get(endpoint, {
      httpsAgent: proxyAgent,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'cache-control': 'no-cache',
        cookie: 'intl_splash=false',
      },
      withCredentials: true,
      timeout: 7000,
    })
    return parseHTML(result.data)
  } catch (e) {
    console.error('[GET_PAGE]: Execution failed with message ' + e)
    return null
  }
}

function getSrc(value: string | undefined) {
  if (!value) {
    return ''
  }
  const split = value.split(' ')
  const attribute = split.find((str) => str.startsWith('src="'))
  if (attribute) {
    return 'https:' + attribute.slice(5, attribute.length - 1)
  }
  return ''
}

async function getFullTitle(link: string) {
  if (link === 'https://getondown.com') {
    return null
  }
  const data = await getHtml(link)

  const title = (data as HTMLElement).querySelector(
    'h1[class="product-meta__title heading h1"]'
  )?.text

  const searchString =
    (data as HTMLElement).querySelector('a.product-meta__vendor')?.text +
    ' ' +
    title?.split('(')[0]

  return {
    postTitle: title,
    artist: (data as HTMLElement).querySelector(
      'a[class="product-meta__vendor link link--accented"]'
    )?.text,
    color: getColor(title!),
    album: title?.split('(')[0],
    searchString: searchString,
    customTitle: searchString
  }
}

function getColor(text: string) {
  if (!text) {
    return ''
  }

  const groupedMetadata = text.match(/\(([^)]+)\)/g) ?? []
  const mediaPattern = /(lp|cd|cassette)/i

  for (const group of groupedMetadata) {
    const groupText = group.slice(1, -1).trim()
    const parts = groupText.split(/\s+/)
    const mediaTokenIndex = parts.findIndex((part) => mediaPattern.test(part))

    if (mediaTokenIndex > 0) {
      return parts.slice(0, mediaTokenIndex).join(' ').trim()
    }
  }

  return ''
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

async function getItems() {
  for (let i = 1; i < 2; i++) {
    const url = getPaginatedUrl(i)
    const data = await getHtml(url)
    const itemsHtmlList = (data as HTMLElement)?.querySelectorAll(
      'div[class="product-item product-item--vertical  1/2--phone 1/3--tablet-and-up 1/4--desk"]'
    )
    let index = 0
    for (let item of itemsHtmlList) {
      const yesterday = new Date(Date.now())
      itemsList.push({
        ...(await getFullTitle(
          'https://getondown.com' +
            item
              .querySelector('a.product-item__image-wrapper')
              ?.getAttribute('href')
        )),
        postId: item.querySelector(
          'input[name="product-id"]'
        )?.getAttribute('value'),
        content:
          'https://getondown.com' +
          item
            .querySelector('a.product-item__image-wrapper')
            ?.getAttribute('href'),
        thumbnail: getSrc(
          item.querySelector('a.product-item__image-wrapper')?.text
        ),
        media: getMediaType(
          item.querySelector('a[class="product-item__title text--strong link"]')
            ?.rawText
        ),
        expires: Math.floor(
          (new Date().getTime() + 20 * 24 * 60 * 60 * 1000) / 1000
        ),
        dateGroup: `DATE#${(yesterday.getMonth() + 1).toString()}`,
        created_time: new Date().toISOString(),
        source: 'Get On Down',
        secondaryId: ulid(),

      })
      index++
    }
  }
}

function dropNonItems(items: Partial<PostInfo>[]) {
  items.filter((item) => item.media !== 'Figure')
}

async function main() {
  try {
    const endpointUrl = getEnv('API_URL')
    await getItems()
    await mergeDiscogsData(itemsList)
    dropNonItems(itemsList)
    await submitItems(itemsList, endpointUrl)
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
