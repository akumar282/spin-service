import { DynamoDBStreamEvent } from 'aws-lambda'

export const mockEvent: DynamoDBStreamEvent = {
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

export const updateReturn = {
  _index: 'users',
  _id: 'V1qxjIkB0ZXY6d7YyOeN',
  _version: 1,
  result: 'created',
  _shards: {
    total: 2,
    successful: 1,
    failed: 0,
  },
  _seq_no: 1,
  _primary_term: 1,
}

export const wrappedReturn: Response = {
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue(updateReturn),
  headers: new Headers(),
  redirected: false,
  statusText: 'OK',
  type: 'basic',
  url: '',
  clone: jest.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  text: jest.fn(),
}
