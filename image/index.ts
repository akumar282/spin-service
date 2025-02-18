import axios from 'axios'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { DiscogsClient } from './discogs/client'
import { ArtistSuccessResponseBody, ResponseBody } from './discogs/types'

// TODO: Change to vinyl releases URL after api creation
const BASE_URL =
  'https://www.reddit.com/svc/shreddit/community-more-posts/new/?name=VinylReleases&adDistance=2&ad_posts_served=1&feedLength=4&after='
const rawPostsQueue: HTMLElement[] = []
const pushPostsQueue: any[] = []

interface postInfo {
  title: string | null | undefined,
  content: string | null | undefined,
  created_time: Date,
  link: URL,
  postId: string | null | undefined,
  pagination: string | null | undefined
}


async function getPage(endpoint: string): Promise<HTMLElement | number> {
  try {
    const data = await axios.get(endpoint, {
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
    console.error('An error occurred:', error)
    throw error
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
        'hover:bg-neutral-background-hover xs:rounded-[16px] px-md py-2xs my-2xs nd:visible"]'))
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
  rawData.map(post => {
    pushPostsQueue.push({
      title: post.getAttribute('post-title'),
      content: post.getAttribute('content-href'),
      link: `https://www.reddit.com${post.getAttribute('permalink')}`,
      created_time: new Date(post.getAttribute('created-timestamp') as string),
      postId: post.getAttribute('id'),
      pagination: post.getAttribute('more-posts-cursor') ?? null,
      searchString: transformString(post.getAttribute('post-title')),
      color: getColor(post.getAttribute('post-title')),
      thumbnail: post.querySelector('div[slot="thumbnail"] img')?.getAttribute('src') ?? null
    })
  })
}

function transformString(title: string | undefined): string {
  if(title === undefined) {
    return 'Void'
  }
  return title
    .replace(/\(.*?\)/g, '')
    .replace(/\s*\w*\s*vinyl/g, '')
    .replace(/\s*\w*LP\w*/g, '')
    .replace(/\$[^\s]*/g, '')
    .replace(/-/g, '')
    .toLowerCase()
    .trim()
}

function getColor(title: string | undefined) {
  if(title === undefined) {
    return 'Black'
  }
  const match = title.match(/\((\w+)\s+vinyl\)/)
  return match ? match[1] : null
}



async function testGet() {
  const auth = {
    personalToken: ''
  }
  const dis = new DiscogsClient(auth)
  const test = {
    query: 'Renee Rapp Snow Angel Exclusive Blue',
  }
  const data = await dis.getData<ResponseBody<ArtistSuccessResponseBody>>('database/search', test)
  console.log(data)
}

async function main() {
  try {
    
  } catch (e) {

  }
}

getRawPosts(BASE_URL).then(() => {
  mapToAttributes(rawPostsQueue)
  console.log(pushPostsQueue)
})