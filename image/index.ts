import axios from 'axios'
import {HTMLElement, parse as parseHTML} from 'node-html-parser'
import { DiscogsClient } from './discogs/client'

// TODO: Change to vinyl releases URL after api creation
const BASE_URL =
  'https://www.reddit.com/svc/shreddit/community-more-posts/new/?name=AskReddit&adDistance=2&ad_posts_served=1&feedLength=4'


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

async function testParse() {
  const data = await getPage(BASE_URL)
  const posts = (data as HTMLElement)?.querySelectorAll('article[class="w-full m-0"]')
  for(let post of posts){
    for(let elements of post.querySelectorAll('shreddit-post[class="block relative cursor-pointer group bg-neutral-background focus-within:bg-neutral-background-hover hover:bg-neutral-background-hover xs:rounded-[16px] px-md py-2xs my-2xs nd:visible"]')) {
      const postData: postInfo = {
        title: elements.getAttribute('post-title'),
        content: elements.getAttribute('content-href'),
        link: `https://www.reddit.com${elements.getAttribute('permalink')}` as unknown as URL,
        created_time: new Date(elements.getAttribute('created-timestamp') as string),
        postId: elements.getAttribute('id'),
        pagination: elements.getAttribute('more-posts-cursor') ?? null
      }
      console.log(postData)
    }
  }

  const dis = new DiscogsClient()
}

testParse().then()