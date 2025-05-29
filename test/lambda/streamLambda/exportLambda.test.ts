import { handler } from '../../../infrastructure/lib/lambdas/streamLambda'
import * as process from 'node:process'
import { Context, DynamoDBStreamEvent } from 'aws-lambda'

describe('environmental variables', () => {
  test('will receive process.env variables', async () => {
    // Set the variables
    process.env.BUCKET_NAME = 'open-search-bucket-1738'
    process.env.OPEN_SEARCH_ENDPOINT =
      'search-spin-data-ncvue37awszjvvba2vsoz5rhym.us-west-2.es.amazonaws.com'
    process.env.DASHPASS = 'xxxxxxxx'
    process.env.USER = 'xxxxx'

    const mockContext: Partial<Context> = {
      logGroupName: 'mockLogGroupName',
    }
    const mockEvent: DynamoDBStreamEvent = {
      Records: [
        {
          eventID: '1',
          eventName: 'INSERT',
          eventVersion: '1.1',
          eventSource: 'aws:dynamodb',
          awsRegion: 'us-west-2',
          eventSourceARN:
            'arn:aws:dynamodb:us-west-2:123456789012:table/records/stream/2025-04-08T00:00:00.000',
          dynamodb: {
            Keys: {
              postId: { S: 'TestID23' },
            },
            NewImage: {
              created_time: { S: '2025-04-08T01:29:31.271Z' },
              postId: { S: 'TestID23' },
              content: {
                S: 'https://www.dominomusic.com/releases/fat-dog/peace-song/12?fbclid=PAZXh0bgNhZW0CMTEAAadlCOAWcIXNo4NObpmdg3kvL7SS_UiQDlDwsdFy_CYJ2ZNHzdT4lWEp4wz5yw_aem_ibAaYwiDlsqxq1eBUmfy5A',
              },
              artist: { S: '[Pre' },
              searchString: { S: '[Pre-Order] Fat Dog - Peace Song 12”' },
              pagination: { NULL: true },
              link: {
                S: 'https://www.reddit.com/r/VinylReleases/comments/1ju1xyl/preorder_fat_dog_peace_song_12/',
              },
              postTitle: { S: '[Pre-Order] Fat Dog - Peace Song 12”' },
              thumbnail: {
                S: 'https://b.thumbs.redditmedia.com/VWOWGPwBAjJVRvBIS5tBiXhNxsGsdXDRBNYp-QliS2E.jpg',
              },
              color: { S: 'Black' },
            },
            StreamViewType: 'NEW_IMAGE',
            SequenceNumber: '111',
            SizeBytes: 1234,
          },
        },
      ],
    }

    const result = await handler(mockEvent, <Context>mockContext)
    expect(result)
  }, 15000)
})
