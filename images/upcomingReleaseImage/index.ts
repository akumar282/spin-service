import axios from 'axios'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { ulid } from 'ulid'
import { getEnv, requestHttpMethod, requestWithBody } from '../utils'

const list: Upcoming[] = []
const BASE_URL = 'https://www.metacritic.com/browse/albums/release-date/coming-soon/date'

type Upcoming = {
  album: string
  artist: string
  note: string
  date: string
  id: string
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

function clean(list: Upcoming[]) {
  list.forEach((item, index) => {
    if(item.album === '' && item.artist === '' && item.note === '') {
      list.splice(index, 1)
    }
  })
}

async function parseData() {
  const data = await getPage(BASE_URL)
  const posts = (data as HTMLElement)?.querySelectorAll('table[class="musicTable"]')
  for (const post of posts) {
    let currentDate: string | undefined = ''
    const subModule = post.querySelectorAll('tr')
    subModule.forEach((x) => {
      if (x.attrs.class === 'module') {
        currentDate = x.text.replace(/(\r\n|\n|\r)/gm, "").trim()
      }
      const note = x.querySelector('td[class="dataComment"]')?.text.replace(/(\r\n|\n|\r)/gm, "").trim()
      const item: Upcoming = {
        artist: x.querySelector('td[class="artistName"]')?.text.replace(/(\r\n|\n|\r)/gm, "").trim() ?? '',
        album: x.querySelector('td[class="albumTitle"]')?.text.replace(/(\r\n|\n|\r)/gm, "").trim() ?? '',
        note: note ?? '',
        date: currentDate !== '' && currentDate ? currentDate : (note ?? ''),
        id: ulid()
      }
      list.push(item)
    })

  }
  clean(list)
  console.log(list)
}
async function main() {

  await parseData()
  try {
    const endpointUrl = getEnv('API_URL')
    for (const item of list) {
      try {
        await requestWithBody('raw', endpointUrl, item, requestHttpMethod.POST)
      } catch (e) {
        console.error(`[API_INGESTION_CALL] Post call failed for ${item.id}`)
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