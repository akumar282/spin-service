import { Item } from '../../apigateway/types'

export function unnestData(item: Item[] | undefined) {
  if (!item) return
  return item.map((item) => {
    return Object.values(item).at(0)!
  })
}

export function nestData(items: string[] | undefined, type: string) {
  if (!items) return
  return items.map((item) => {
    return { [type]: item, type } as Item
  })
}
