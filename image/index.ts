import axios from 'axios'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { DiscogsClient } from './discogs/client'
import { ResponseBody, SearchResult } from './discogs/types'
import { getEnv, requestHttpMethod, requestWithBody } from './utils'
import { HttpsProxyAgent } from 'https-proxy-agent'

const BASE_URL =
  'https://www.reddit.com/svc/shreddit/community-more-posts/new/?name=VinylReleases&adDistance=2&ad_posts_served=1&feedLength=4&after='

const rawPostsQueue: HTMLElement[] = []
const pushPostsQueue: Partial<PostInfo>[] = []

// const ProxyIp = getEnv('PROXY_IP')
//
// const proxyAgent = new HttpsProxyAgent(ProxyIp)

type PostInfo = {
  postTitle: string | null | undefined,
  content: string | null | undefined,
  created_time: Date,
  link: string,
  postId: string | null | undefined,
  pagination: string | null | undefined
  searchString: string
  color: string | null,
  thumbnail: string | null,
  genre: string[],
  title: string,
  year: string,
  artist: string | null,
  label: string[],
  resource_url: URL,
  uri: string,
  media: string,
  dateGroup: string,
  expires: number
}

async function getPage(endpoint: string): Promise<HTMLElement | number> {
  try {
    const data = await axios.get(endpoint, {
      // httpsAgent: proxyAgent,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'cache-control': 'no-cache',
        "accept-encoding": "gzip, deflate, br",
        "cookie": "intl_splash=false"
      },
    })
    return parseHTML(data.data)
  } catch (error) {
    console.error('[GET_PAGE]: Execution failed with message ' + error)
    return 400
  }
}

async function getRawPosts(url: string) {
  let paginationToken: string | null = null
  for (let i = 0; i < 2; i++) {
    let urlPage = url
    if(paginationToken) {
      if(paginationToken.includes('=DAY')) {
        urlPage = urlPage.slice(0, 126)
      }
      urlPage += `${paginationToken}%3D%3D&t=DAY`
    }
    const data = await getPage(urlPage)
    const posts = (data as HTMLElement)?.querySelectorAll('article[class="w-full m-0"]')
    for(let post of posts){
      for(let elements of post.querySelectorAll('shreddit-post[class="' +
        'block relative cursor-pointer group bg-neutral-background focus-within:bg-neutral-background-hover ' +
        'hover:bg-neutral-background-hover xs:rounded-4 px-md py-2xs my-2xs nd:visible"]'))
      {
        rawPostsQueue.push(elements)
        let token = elements.getAttribute('more-posts-cursor')
        if (token !== undefined) {
          paginationToken = token
        }
      }
    }
  }
}

function mapToAttributes(rawData: HTMLElement[]) {
  const yesterday = new Date(Date.now())
  rawData.map(post => {
    pushPostsQueue.push({
      postTitle: post.getAttribute('post-title'),
      content: post.getAttribute('content-href'),
      link: `https://www.reddit.com${post.getAttribute('permalink')}`,
      created_time: new Date(post.getAttribute('created-timestamp') as string),
      postId: post.getAttribute('id'),
      pagination: post.getAttribute('more-posts-cursor') ?? null,
      searchString: transformString(post.getAttribute('post-title')),
      color: getColor(post.getAttribute('post-title')),
      artist: getArtist(post.getAttribute('post-title')),
      thumbnail: post.querySelector('div[slot="thumbnail"] img')?.getAttribute('src') ?? null,
      media: 'vinyl',
      dateGroup: `DATE#${(yesterday.getMonth() + 1).toString()}-${yesterday.getDate().toString()}`,
      expires: Math.floor((new Date().getTime() + 20 * 24 * 60 * 60 * 1000) / 1000)
    })
  })
}

function transformString(title: string | undefined): string {
  if(title === undefined) {
    return 'Void'
  }
  const match = title.match(/^(.+?)(?=\s*[\(\[\|"]|$)/)
  return match ? match[1].trim() : title.trim()
}

function getColor(title: string | undefined) {
  if(title === undefined) {
    return 'Black'
  }
  const match = title.match(/(\w+)\s+Vinyl/i)
  return match ? match[1] : 'Black'
}

function getArtist(input: string | undefined): string {
  const clean = transformString(input)
  const index = clean.indexOf('-')
  if (index === -1 ) {
    return clean
  }
  const substring =  clean.substring(0, index).trim()
  const lowerCase = substring.toLowerCase()
  return lowerCase.split(' ')
    .map((x) => x.charAt(0).toUpperCase() + x.substring(1))
    .join(' ')
}

async function joinWithDiscogs(postsQueue: Partial<PostInfo>[]) {
  const discogsClient = new DiscogsClient({
    personalToken: getEnv('DISCOGS_TOKEN')
  })
  for (const item of postsQueue) {
    if(!item.searchString) {
      return
    }
    const data = await discogsClient.getData<ResponseBody<SearchResult>>(
      'database/search',
      { query: item.searchString }
    )
    if('results' in data) {
      const first = data.results.pop()
      if(first !== undefined) {
        item.title = first.title
        item.resource_url = first.resource_url
        item.genre = first.genre
        item.label = first.label
        item.thumbnail ||= first.thumb
        item.uri = first.uri
        item.year = first.year
      }
    } else {
      console.warn(`[DISCOGS_CALL]: ${item.postTitle} not found in Discogs`)
    }
  }
}

async function main() {
  try {
    // if(ProxyIp) {
    //   console.info('Proxy Loaded: ' + ProxyIp)
    // }
    const endpointUrl = getEnv('API_URL')
    await getRawPosts(BASE_URL)
    mapToAttributes(rawPostsQueue)
    await joinWithDiscogs(pushPostsQueue)
    for (const item of pushPostsQueue) {
      try {
        await requestWithBody('raw', endpointUrl, item, requestHttpMethod.POST)
      } catch (e) {
        console.error(`[API_INGESTION_CALL] Post call failed for ${item.postId}`)
      }
    }
  } catch (e) {
    console.error('[MAIN]: Execution failed with message ' + e)
  }
}

main().then(() => {
  const time = new Date().toString()
  console.info('Run complete: ' + time)
}).catch((error) => {
  console.error(error)
})