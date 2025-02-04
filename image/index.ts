import axios from 'axios'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'

const BASE_URL =
  'https://www.reddit.com/svc/shreddit/community-more-posts/new/?name=AskReddit&adDistance=2&ad_posts_served=1&feedLength=4'

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
    const parsedData = parseHTML(data.data);

    return parsedData;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

async function testParse() {
  const data = await getPage(BASE_URL)
  const posts = (data as HTMLElement)?.querySelectorAll('article[class="w-full m-0"]')
  console.log(posts)
}

testParse().then()