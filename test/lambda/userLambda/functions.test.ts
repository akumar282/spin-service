import {
  nestData,
  unnestData,
} from '../../../infrastructure/lib/lambdas/userLambda/functions'
import { Item, ItemStore } from '../../../infrastructure/lib/apigateway/types'

describe('Assorted test for functions', () => {
  test('Will unnest data', async () => {
    const list: Item[] = [
      { artist: 'Playboi Carti', type: 'artist', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', type: 'artist', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', type: 'artist', value: 'Playboi Carti' },
      { genre: 'Playboi Carti', type: 'genre', value: 'Playboi Carti' },
    ]
    const result = unnestData(list)
    expect(result).toEqual([
      'Playboi Carti',
      'Playboi Carti',
      'Playboi Carti',
      'Playboi Carti',
    ])
  })

  test('Will nest data', async () => {
    const list: ItemStore[] = [
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
      { artist: 'Playboi Carti', value: 'Playboi Carti' },
    ]
    const result = nestData(list, 'artist')
    expect(result).toEqual([
      { artist: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', type: 'artist' },
    ])
  })
})
