import { Item, ItemStore } from '../../apigateway/types'

export function unnestDataBasic(item: Item[] | undefined) {
  if (!item) return
  return item.map((item) => {
    return Object.values(item).at(0)!
  })
}

export function nestDataBasic(items: string[] | undefined, type: string) {
  if (!items) return
  return items.map((item) => {
    return { [type]: item, type } as Item
  })
}

export function unnestData(item: Item[] | undefined) {
  if (!item) return
  return item.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...itemNoType } = item
    return itemNoType
  })
}

export function nestData(items: ItemStore[] | undefined, type: string) {
  if (!items) return
  return items.map((item) => {
    return { ...item, type } as Item
  })
}
