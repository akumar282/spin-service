import { createQuery } from '../../infrastructure/lib/lambdas/processingLambda/functions'
import { getEnv, requestWithBody } from '../../infrastructure/lib/shared/utils'
import process from 'node:process'

describe('Assorted test for functions', () => {
  test('Will generate correct open search query', async () => {
    const result = createQuery('PinkPantheress', ['R&B', 'Pop'])
    expect(result).toEqual({
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  { match: { artists: 'PinkPantheress' } },
                  { match: { genres: 'R&B' } },
                  { match: { genres: 'Pop' } },
                ],
                minimum_should_match: 1,
              },
            },
          ],
        },
      },
    })
  })

  test('Will make no list', async () => {
    const result = createQuery('PinkPantheress', [])
    expect(result).toEqual({
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [{ match: { artists: 'PinkPantheress' } }],
                minimum_should_match: 1,
              },
            },
          ],
        },
      },
    })
  })

  test.skip('[IT] Can query OS for users', async () => {
    process.env.DASHPASS = ''
    process.env.USER = ''
    const endpoint =
      'https://search-spin-data-ncvue37awszjvvba2vsoz5rhym.us-west-2.es.amazonaws.com/'

    const userQueryBody = createQuery('PinkPantheress', [])
    const data = await requestWithBody(
      'users/_search',
      endpoint,
      userQueryBody,
      'POST',
      `Basic ${Buffer.from(`${getEnv('USER')}:${getEnv('DASHPASS')}`).toString(
        'base64'
      )}`
    )

    const result = await data.json()
    expect(result.hits.hits[0]._source.artists).toContain('PinkPantheress')
  })
})
