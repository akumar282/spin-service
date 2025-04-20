import { handler } from '../../infrastructure/lib/lambdas/oneTimeExportLambda'
import * as process from 'node:process'

describe('environmental variables', () => {
  test('will receive process.env variables', async () => {
    // Set the variables
    process.env.BUCKET_NAME = 'open-search-bucket-1738'
    process.env.OPEN_SEARCH_ENDPOINT =
      'https://search-spin-data-ncvue37awszjvvba2vsoz5rhym.us-west-2.es.amazonaws.com/'

    const result = await handler()
    expect(result)
  }, 15000)
})
