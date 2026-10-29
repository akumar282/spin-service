import axios from 'axios'
import { HTMLElement } from 'node-html-parser'
import { PostInfo } from 'shared/src/types'
import { ulid } from 'ulid'
import {
  getEnv,
  mergeDiscogsData,
  submitItems,
} from 'shared/src/functions'

const parsedData: Partial<PostInfo>[] = []

type BloodType = {
  REDACTED: string
}


async function getData(
  url: string,
  headers?: object,
) {
  const data = await axios.get(url, {
    headers: {
      ...headers,
    },
    withCredentials: true,
    timeout: 7000,
  })
  return data.data as { products: BloodType[] }
}

async function main() {
  try {
    const data = await getData(
      'I am not telling you. Blocking dev tools won\'t stop anyone'
    )
    // console.log(data)
    for (const item of data.products) {
      const yesterday = new Date(Date.now())
      const artbum = item.title.split('-', 2)
      const mappedItem: Partial<PostInfo> = {
        postId: item.id.toString(),
        title: item.title,
        content: `https://blood-records.co.uk/products/${item.handle}`,
        created_time: new Date().toISOString(),
        dateGroup: `DATE#${(yesterday.getMonth() + 1).toString()}`,
        secondaryId: ulid(),
        artist: artbum.at(0)?.trim() ?? null,
        album: artbum.at(1)?.trim() ?? 'Default Album',
        media: item.product_type,
        customTitle: artbum.toString(),
        productImage: item.images[0].src,
        price: item.variants[0].price,
        thumbnail: item.images[0].src,
        link: `https://blood-records.co.uk/products/${item.handle}`,
        searchString: artbum.at(0)?.trim() + " " + artbum.at(1)?.trim(),
      }
      parsedData.push(mappedItem)
    }

    await mergeDiscogsData(parsedData)
    await submitItems(parsedData, getEnv('API_URL'))
    console.log('here')
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
