import {
  nestData,
  unnestData,
} from '../../../infrastructure/lib/lambdas/userLambda/functions'
import { Item } from '../../../infrastructure/lib/apigateway/types'

describe('Assorted test for functions', () => {
  test('Will unnest data', async () => {
    const list: Item[] = [
      { artist: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', type: 'artist' },
      { genre: 'Playboi Carti', type: 'genre' },
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
    const list: string[] = ['Playboi Carti', 'Playboi Carti', 'Playboi Carti']
    const result = nestData(list, 'artist')
    expect(result).toEqual([
      { artist: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', type: 'artist' },
      { artist: 'Playboi Carti', type: 'artist' },
    ])
  })
})
