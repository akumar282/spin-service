import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { chromium } from 'playwright'
import { PostInfo } from 'shared/src/types'
import { ulid } from 'ulid'
import {
  getEnv,
  getParsedHtml,
  mergeDiscogsData,
  submitItems,
} from 'shared/src/functions'

let unparsedData: HTMLElement[] = []
const parsedData: Partial<PostInfo>[] = []

function imageUrlToId(url: string): string {
  let hash = 5381

  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) + hash) ^ url.charCodeAt(i)
  }

  return (hash >>> 0).toString(36)
}

async function followLinks(links: Partial<PostInfo>[]) {
  for (let item of links) {
    const yesterday = new Date(Date.now())
    const data = await getParsedHtml(item.content!) as HTMLElement
    item.artist = data.querySelector('h1.block-product__title')?.text.trim()
    item.album = data.querySelector(
      'div.block-product__sub-title'
    )?.text.trim()
    item.price = data.querySelector('div.block-product__price')?.text.trim()
    item.releaseDate = data.querySelector('div.block-product__small')?.text.trim()
    item.releaseType = data.querySelector('div.block-product__buy')?.text.trim() != 'Sold Out' ? null : 'SOLD OUT'
    item.source = 'BLOODRECS'
    item.created_time = new Date().toISOString()
    item.expires = Math.floor(
      (new Date().getTime() + 20 * 24 * 60 * 60 * 1000) / 1000
    )
    item.secondaryId = ulid()
    item.searchString = item.artist + ' ' + item.album
    item.color = 'Special Edition'
    item.customTitle = item.artist + ' ' + item.album
    item.dateGroup = `DATE#${(yesterday.getMonth() + 1).toString()}`
    item.postId = imageUrlToId(item.thumbnail!)
  }
}

async function getLinks(data: HTMLElement[]) {
  for (const item of data) {
    parsedData.push({
      content: 'https://blood-records.co.uk' + item.querySelector('a')?.getAttribute('href'),
      thumbnail: 'https:' + item.querySelector('img.lazy')?.getAttribute('data-src')
    })
  }
}



async function main() {
  try {
    const data = await getParsedHtml('https://blood-records.co.uk/collections/all')
    const chunk = (data as HTMLElement).querySelector(
      'div.slideshow--vinyl'
    )
    const item = chunk?.querySelectorAll('div.slideshow__slide')
    if (item === null || item === undefined) {
      console.log('no item')
      return
    }
    await getLinks(item)
    await followLinks(parsedData)
    await mergeDiscogsData(parsedData)
    console.log(parsedData)
    await submitItems(parsedData, getEnv('API_URL'))
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
