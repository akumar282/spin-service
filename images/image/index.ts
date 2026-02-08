import axios, { AxiosError } from 'axios'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { DiscogsClient } from './discogs/client'
import { ResponseBody, SearchResult } from './discogs/types'
import { ulid } from 'ulid'
import { mapToData } from './secondaryParsing/parse'
import { chromium } from 'playwright'
import { getEnv } from './util'

const BASE_URL =
  'https://www.reddit.com/svc/shreddit/community-more-posts/new/?name=VinylReleases&adDistance=2&ad_posts_served=1&feedLength=4&after='

const rawPostsQueue: HTMLElement[] = []
const pushPostsQueue: Partial<PostInfo>[] = []

// const ProxyIp = getEnv('PROXY_IP')
//
// const proxyAgent = new HttpsProxyAgent(ProxyIp)

export type PostInfo = {
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
  expires: number,
  preorder: boolean,
  secondaryId: string,
  source: string,
  album: string,
  releaseType: string | null,
  edition: string | null,
  releaseDate: string | null,
  format: string | null,
  moreContent: string | null
  region: string | null,
  isAnnouncement: boolean,
  productImage: string
}

/* *******************************************
 UTILS
 *********************************************/

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

const contentAttr =
  'a[class="relative pointer-events-auto a cursor-pointer\n' +
  '  \n' +
  '  \n' +
  '  \n' +
  '  \n' +
  '  underline\n' +
  '  "]'

/* *******************************************
  FETCH FUNCTIONS
 *********************************************/


async function getPage(endpoint: string, headers?: object): Promise<HTMLElement | null> {
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
      withCredentials: true
    })
    return parseHTML(data.data)
  } catch (error) {
    console.error('[GET_PAGE]: Execution failed with message ' + error)
    return null
  }
}

async function whichContent(item: HTMLElement): Promise<string | null> {
  const contentAttributes = item.getAttribute('content-href')
  const requery = !!item.querySelector('figure[class="h-full w-full m-0 z-10 flex items-center"]') || !!contentAttributes?.includes('i.redd') || !!contentAttributes?.includes('reddit.com')
  if (requery) {
    const link = item.getAttribute('permalink')
    try {
      const result = await getPage(`https://www.reddit.com${link}`)
      if (result) {
        return result.querySelector(contentAttr)?.getAttribute('href') ?? null
      }
    } catch (e) {
      console.log(`[REQUERY] Fetch of content failed with ${e} for `, link)
    }
    return null
  }

  if (contentAttributes) {
    return contentAttributes ?? null
  }

  return null
}

async function whichPicture(posts: Partial<PostInfo>[]) {
  for (const post of posts) {
    let image
    const content = post.content
    if (content) {
      try {
        const siteData = await getPage(content)
        image = (siteData as HTMLElement).querySelector('meta[property="og:image"], meta[name="og:image"]')?.getAttribute('content')
      } catch (e) {
        console.log(`[IMAGE_FETCH] primary method failed for ${post.content} trying alternative: `, e)
        try {
          image = await getOgImage(content)
        } catch (e) {
          console.log(`[IMAGE_FETCH] failed for ${post.content}: `, e)
        }
      }
    }
    post.thumbnail = image ?? null
  }
}

async function getOgImage(url: string) {

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  const context = await browser.newContext({
    locale: 'de-DE',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: {
      'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      'upgrade-insecure-requests': '1',
    },
  })

  const page = await context.newPage()

  page.on('response', response => {
    if (response.url().includes('roughtrade.com') && [403, 429, 503].includes(response.status())) {
      console.log('blocked response', response.status(), response.url())
    }
  })

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

  const result = await page.waitForSelector('meta[property="og:image"]', { state: 'attached', timeout: 45000 }).then(() => 'og')

  if (result !== 'og') {
    const title = await page.title().catch(() => '')
    const htmlStart = (await page.content().catch(() => '')).slice(0, 400)
    await browser.close()
    throw new Error(`Did not reach product HTML (likely challenge). title="${title}" html="${htmlStart}"`)
  }

  const og = await page.getAttribute('meta[property="og:image"]', 'content')
  await browser.close()
  return og
}

/* *******************************************
  PARSING
 *********************************************/


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
  rawData.map(async post => {
    pushPostsQueue.push({
      postTitle: post.getAttribute('post-title'),
      content: await whichContent(post),
      link: `https://www.reddit.com${post.getAttribute('permalink')}`,
      created_time: new Date(post.getAttribute('created-timestamp') as string),
      postId: post.getAttribute('id'),
      pagination: post.getAttribute('more-posts-cursor') ?? null,
      searchString: transformString(post.getAttribute('post-title')),
      color: getColor(post.getAttribute('post-title')),
      artist: getArtist(post.getAttribute('post-title')),
      thumbnail: post.querySelector('div[slot="thumbnail"] img')?.getAttribute('src') ?? null,
      releaseType: post
        .querySelector('div[class="flair-content [&_.flair-image]:align-bottom max-w-full overflow-hidden whitespace-nowrap text-ellipsis"]')
        ?.text
        .replace(/(\r\n|\n|\r)/gm, "")
        .trim(),
      media: 'vinyl',
      dateGroup: `DATE#${(yesterday.getMonth() + 1).toString()}`,
      expires: Math.floor((new Date().getTime() + 20 * 24 * 60 * 60 * 1000) / 1000),
      source: 'Reddit (r/VinylReleases)',
      secondaryId: ulid(),
      moreContent: post.querySelector('a[class="relative pointer-events-auto a cursor-pointer\n' +
        '  \n' +
        '  \n' +
        '  \n' +
        '  \n' +
        '  underline\n' +
        '  "]')?.getAttribute('href') ?? null
    })
  })
}

/* *******************************************
  DISCOGS
 *********************************************/

async function joinWithDiscogs(postsQueue: Partial<PostInfo>[]) {
  const discogsClient = new DiscogsClient({
    personalToken: getEnv('DISCOGS_TOKEN')
  })
  for (const item of postsQueue) {
    if(!item.searchString) {
      continue
    }
    const data = await discogsClient.getData<ResponseBody<SearchResult>>(
      'database/search',
      { query: item.searchString }
    )
    if('results' in data) {
      const filteredList = data.results.filter((item) => item.type != 'artist')
      const first = filteredList[0]
      if(first !== undefined) {
        item.title = first.title
        item.resource_url = first.resource_url
        item.genre = first.genre
        item.label = first.label
        item.thumbnail = item.thumbnail === null ? first.thumb : item.thumbnail
        item.uri = first.uri
        item.year = first.year
      }
    } else {
      console.warn(`[DISCOGS_CALL]: Call failed for: ${item.postTitle}`)
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
    await mapToAttributes(rawPostsQueue)
    await mapToData(pushPostsQueue)
    await whichPicture(pushPostsQueue)
    await joinWithDiscogs(pushPostsQueue)
    for (const item of pushPostsQueue) {
      try {
        const result = await axios.post('raw', item, { baseURL: endpointUrl })
        console.log(result)
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.status === 300) {
            console.info(`\x1b[33m[API_INGESTION_CALL] duplicate item ${item.postId} \x1b[0m`)
          }
        } else {
          console.error(`[API_INGESTION_CALL] Post call failed for ${item.postId} `)
        }
      }
    }
  } catch (e) {
    console.error('[MAIN]: Execution failed with message ' + JSON.stringify(e))
  }
}

main().then(() => {
  const time = new Date().toString()
  console.info('Run complete: ' + time)
}).catch((error) => {
  console.error(error)
})