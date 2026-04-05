import { DiscogsClient, ResponseBody, SearchResult } from 'discogs-client'
import { PostInfo } from './types'
import axios, { AxiosError } from 'axios'
import { HTMLElement, parse } from 'node-html-parser'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { chromium, Page } from 'playwright'

export async function mergeDiscogsData(items: Partial<PostInfo>[]) {
  const discogsClient = new DiscogsClient({
    personalToken: getEnv('DISCOGS_TOKEN'),
  })
  for (const item of items) {
    if (!item.searchString) {
      continue
    }
    const data = await discogsClient.getData<ResponseBody<SearchResult>>(
      'database/search',
      { query: item.searchString }
    )
    if ('results' in data) {
      const filteredList = data.results.filter((item) => item.type !== 'artist')
      const first = filteredList[0]
      if (first !== undefined) {
        item.resource_url = first.resource_url
        item.genre = first.genre
        item.label = first.label
        item.uri = first.uri
        item.year = first.year
      }
    } else {
      console.warn(`[DISCOGS_CALL]: Call failed for: ${item.postTitle}`)
    }
  }
}

export function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) {
    throw new Error(`Error: ${name} not defined`)
  }
  return val
}

export async function submitItems(
  items: Partial<PostInfo>[],
  endpointUrl: string
) {
  for (const item of items) {
    try {
      await axios.post('raw', item, { baseURL: endpointUrl })
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.status === 300) {
          console.info(
            `\x1b[33m[API_INGESTION_CALL] duplicate item ${item.postId} \x1b[0m`
          )
        }
      } else {
        console.error(
          `[API_INGESTION_CALL] Post call failed for ${item.postId} `
        )
      }
    }
  }
}

export async function getParsedHtml(
  endpoint: string,
  headers?: object,
  proxyAgent?: HttpsProxyAgent
): Promise<HTMLElement | null> {
  try {
    const data = await axios.get(endpoint, {
      ...(proxyAgent || {}),
      headers: {
        ...headers,
      },
      withCredentials: true,
      timeout: 7000,
    })
    return parse(data.data)
  } catch (error) {
    console.error(`[GET_PAGE]: Execution failed with message ${error}`)
    return null
  }
}

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
