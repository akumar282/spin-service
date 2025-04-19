import { handler } from '../../infrastructure/lib/lambdas/oneTimeExportLambda'

describe('environmental variables', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  test('will receive process.env variables', async () => {
    // Set the variables
    process.env.BUCKET_NAME = 'open-search-bucket-1738'

    const result = await handler()
    expect(result)
  })
})
