import {
  DiscogsClient,
  ResponseBody,
  SearchResult,
} from '../../../packages/discogs'

describe('Tests for discogs client', () => {
  test('Client rate limit test', async () => {
    const client = new DiscogsClient()
    const consoleSpy = jest.spyOn(console, 'info')

    for (let i = 0; i < 26; i++) {
      const searchResult: ResponseBody<SearchResult> = await client.searchData(
        'Frank Ocean'
      )
      console.info(`Completed Request: ${i + 1}`)

      if ('results' in searchResult) {
        expect(searchResult.results)
      }
    }
    expect(consoleSpy).toHaveBeenCalledWith('Sleeping for rate limits: V2')
  }, 70000)
})
