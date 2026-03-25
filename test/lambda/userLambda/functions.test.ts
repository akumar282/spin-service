import {
  nestData,
  nestDataBasic,
  unnestData,
  unnestDataBasic,
} from '../../../infrastructure/lib/lambdas/userLambda/functions'
import { Item, ItemStore } from '../../../infrastructure/lib/apigateway/types'

describe('Assorted test for functions', () => {
  test('unnestData removes type and keeps value payload', async () => {
    const list: Item[] = [
      { artist: 'Playboi Carti', type: 'artist', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', type: 'artist', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', type: 'artist', value: 'Playboi Carti' },
      { genre: 'Playboi Carti', type: 'genre', value: 'Playboi Carti' },
    ]

    const result = unnestData(list)

    expect(result).toEqual([
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
      { genre: 'Playboi Carti', value: 'Playboi Carti' },
    ])
  })

  test('nestData appends type to each object', async () => {
    const list: ItemStore[] = [
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
    ]

    const result = nestData(list, 'artist')

    expect(result).toEqual([
      { artist: 'Playboi Carti', value: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', value: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', value: 'Playboi Carti', type: 'artist' },
    ])
  })

  test('unnestDataBasic returns first value from each entry', async () => {
    const list: Item[] = [
      { custom: 'wishlist', type: 'custom', value: 'wishlist' },
      { custom: 'drops', type: 'custom', value: 'drops' },
    ]

    const result = unnestDataBasic(list)

    expect(result).toEqual(['wishlist', 'drops'])
  })

  test('nestDataBasic wraps strings with the provided type', async () => {
    const result = nestDataBasic(['wishlist', 'drops'], 'custom')

    expect(result).toEqual([
      { custom: 'wishlist', type: 'custom' },
      { custom: 'drops', type: 'custom' },
    ])
  })

  test('all helpers return undefined for undefined input', async () => {
    expect(unnestData(undefined)).toBeUndefined()
    expect(nestData(undefined, 'artist')).toBeUndefined()
    expect(unnestDataBasic(undefined)).toBeUndefined()
    expect(nestDataBasic(undefined, 'custom')).toBeUndefined()
  })
})
