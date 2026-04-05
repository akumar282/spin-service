import { DiscogsClient, ResponseBody, SearchResult } from 'discogs-client'
import { PostInfo } from './types'
import axios, { AxiosError } from 'axios'

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
