import {
  APIGatewayProxyEvent,
  Context,
  DynamoDBStreamEvent,
  SQSEvent,
} from 'aws-lambda'
import { marshall } from '@aws-sdk/util-dynamodb'
import {
  NotifyTypes,
  OpenSearchUserResult,
  User,
} from '../../infrastructure/lib/apigateway/types'

export const item = {
  created_time: '2025-04-08T01:29:31.271Z',
  postId: 'TestID23',
  content:
    'https://www.dominomusic.com/releases/fat-dog/peace-song/12?fbclid=PAZXh0bgNhZW0CMTEAAadlCOAWcIXNo4NObpmdg3kvL7SS_UiQDlDwsdFy_CYJ2ZNHzdT4lWEp4wz5yw_aem_ibAaYwiDlsqxq1eBUmfy5A',
  artist: '[Pre',
  searchString: '[Pre-Order] Fat Dog - Peace Song 12”',
  pagination: null,
  link: 'https://www.reddit.com/r/VinylReleases/comments/1ju1xyl/preorder_fat_dog_peace_song_12/',
  postTitle: '[Pre-Order] Fat Dog - Peace Song 12”',
  thumbnail:
    'https://b.thumbs.redditmedia.com/VWOWGPwBAjJVRvBIS5tBiXhNxsGsdXDRBNYp-QliS2E.jpg',
  color: 'Black',
}

export const postTestConst = {
  postTitle: 'test',
  content: 'test',
  link: 'test',
  created_time: 'test',
  postId: 'test',
  pagination: 'test',
  searchString: 'test',
  color: 'test',
  thumbnail: 'test',
}

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

export const wrappedStreamReturn: Response = {
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

export const users = [
  {
    albums: [],
    notifyType: ['EMAIL'],
    artists: ['PinkPantheress'],
    phone: '',
    genres: ['Jazz', 'Hip Pop', 'R&B'],
    user_name: 'Jonesy.FromFornite@gmail.com',
    id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
    email: 'Jonesy.FromFornite@gmail.com',
    labels: [],
    countryCode: { iso: 'US', dial: '+1' },
    custom: [],
  },
  {
    albums: [],
    notifyType: ['SMS', 'EMAIL'], // Need to make sure this isn't possible (6/18/25)  <- what? (2/24/26)
    artists: ['PinkPantheress'],
    phone: '',
    genres: ['Jazz', 'Pop', 'Hip Hop', 'Rock'],
    user_name: 'Jonesy.FromFornite@gmail.com',
    id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
    email: 'Jonesy.FromFornite@gmail.com',
    labels: [],
    countryCode: { iso: 'US', dial: '+1' },
    custom: [],
  },
  {
    albums: [],
    notifyType: ['SMS'],
    artists: ['PinkPantheress'],
    phone: '+14257372110',
    genres: ['Hip Hop', 'Rock', 'Electronic', 'Hip Pop', 'R&B'],
    user_name: 'Jonesy.FromFornite@gmail.com',
    id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
    email: 'Jonesy.FromFornite@gmail.com',
    labels: [],
    countryCode: { iso: 'US', dial: '+1' },
    custom: [],
  },
  {
    albums: [],
    notifyType: ['SMS', 'EMAIL', 'PUSH'],
    artists: ['PinkPantheress'],
    phone: '+14257372110',
    genres: ['Jazz', 'Pop', 'Hip Hop', 'Rock', 'Electronic', 'Hip Pop', 'R&B'],
    user_name: 'Jonesy.FromFornite@gmail.com',
    id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
    email: 'Jonesy.FromFornite@gmail.com',
    labels: [],
    countryCode: { iso: 'US', dial: '+1' },
    custom: [],
  },
]

export const testUser = {
  albums: [],
  notifyType: ['EMAIL'],
  artists: ['PinkPantheress'],
  phone: '+14257372110',
  genres: ['Jazz', 'Pop', 'Hip Hop', 'Rock', 'Electronic', 'Hip Pop', 'R&B'],
  user_name: 'Jonesy.FromFornite@gmail.com',
  id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
  email: 'Jonesy.FromFornite@gmail.com',
  labels: [],
  countryCode: { iso: 'US', dial: '+1' },
  custom: [],
}

export const record1 = {
  id: 't3_1jtink0',
  year: '2024',
  media: 'vinyl' as 'cd' | 'vinyl',
  created_time: '2025-04-07T11:09:20.321Z',
  postId: 't3_1jtink0',
  resource_url: 'https://api.discogs.com/releases/28578895',
  content:
    'https://poorcreature.ffm.to/allsmiles?fbclid=PAY2xjawJgkZxleHRuA2FlbQIxMQABp6Z679xSMoCEVGRu77JOdrX3fYvpQJmH6b-_WxxAcjQKNVegDKRB0BO12WZ0_aem_hpphHLIa-rg6YgeOYfwOJg',
  artist: 'Poor Creature',
  pagination: null,
  label: ['Uncut', 'Kelsey Media', 'UK Music', 'Sound Performance'],
  genre: ['Electronic', 'Rock', 'Folk, World, & Country'],
  searchString: 'Poor Creature - All Smiles Tonight',
  link: 'https://www.reddit.com/r/VinylReleases/comments/1jtink0/poor_creature_all_smiles_tonight_lankum_members/',
  postTitle: 'Poor Creature - All Smiles Tonight ( Lankum members)',
  thumbnail:
    'https://b.thumbs.redditmedia.com/itn7DBqmY8wXFMX4NLNNK8O589dpNXGVpNIj7MT8Idw.jpg',
  color: 'Black',
  title:
    "Various - The Planet That You're On (A Journey Into New Irish Music Curated By Lankum)",
}

export const userTest: User = {
  albums: [],
  notifyType: ['EMAIL' as NotifyTypes],
  artists: ['PinkPantheress'],
  phone: '',
  genres: ['Jazz', 'Hip Pop', 'R&B'],
  user_name: 'Jonesy.FromFornite@gmail.com',
  id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
  email: 'Jonesy.FromFornite@gmail.com',
  labels: [],
  countryCode: { iso: 'US', dial: '+1' },
  custom: [],
}

export const openSearchReturn: OpenSearchUserResult = {
  took: 1,
  timed_out: false,
  _shards: {
    total: 4,
    successful: 0,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: {
      value: 0,
      relation: '',
    },
    max_score: 0,
    hits: [
      {
        _index: 'users',
        _id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
        _score: 2,
        _source: userTest,
      },
    ],
  },
}

export const wrappedReturn: Response = {
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue(openSearchReturn),
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

const body = JSON.stringify({
  eventID: '69f59a37847b8546d90c4d4ce4622534',
  eventName: 'INSERT',
  eventVersion: '1.1',
  eventSource: 'aws:dynamodb',
  awsRegion: 'us-west-2',
  dynamodb: {
    ApproximateCreationDateTime: 1747892204,
    NewImage: marshall({
      id: 't3_1jtink0',
      year: '2024',
      media: 'vinyl' as 'cd' | 'vinyl',
      created_time: '2025-04-07T11:09:20.321Z',
      postId: 't3_1jtink0',
      resource_url: 'https://api.discogs.com/releases/28578895',
      content:
        'https://poorcreature.ffm.to/allsmiles?fbclid=PAY2xjawJgkZxleHRuA2FlbQIxMQABp6Z679xSMoCEVGRu77JOdrX3fYvpQJmH6b-_WxxAcjQKNVegDKRB0BO12WZ0_aem_hpphHLIa-rg6YgeOYfwOJg',
      artist: 'PinkPantheress',
      pagination: null,
      label: ['Uncut', 'Kelsey Media', 'UK Music', 'Sound Performance'],
      genre: ['Electronic', 'Rock', 'Folk, World, & Country'],
      searchString: 'Poor Creature - All Smiles Tonight',
      link: 'https://www.reddit.com/r/VinylReleases/comments/1jtink0/poor_creature_all_smiles_tonight_lankum_members/',
      postTitle: 'Poor Creature - All Smiles Tonight ( Lankum members)',
      thumbnail:
        'https://b.thumbs.redditmedia.com/itn7DBqmY8wXFMX4NLNNK8O589dpNXGVpNIj7MT8Idw.jpg',
      color: 'Black',
      title:
        "Various - The Planet That You're On (A Journey Into New Irish Music Curated By Lankum)",
    }),
    SequenceNumber: '318881800001864057203738552',
    SizeBytes: 137,
    StreamViewType: 'NEW_IMAGE',
  },
  eventSourceARN:
    'arn:aws:dynamodb:us-west-2:739292628626:table/recordsTableNew/stream/2025-04-03T08:05:31.347',
})

export const sqsEvent: SQSEvent = {
  Records: [
    {
      messageId: '66cdb011-2c91-485f-b81a-ee85419dc3ee',
      receiptHandle:
        'AQEBI9HAM36ffRG86jjOoAMs04ppiDvO6yNydAa1/xbNBwA0z4YNhVb5e08ITztU1NHIXEBWkDHdwSsCUSRJ/K5i5jnZVhKV7IfUtIGQWtn15ofU5tmlRS8bOjukz2NkgfIfGhLnLo4C6fWq0zA9h4ktqYYaa3IKuxiNN1UB/iMG6hvLvcplyfhD14AhNQjBN/X1dTkgsPjISdL15fY01xrd9Daq4C4mIKWOlODWqZsb5/hCfsECmW925PnivJFbanGuFGKYV9M/6XsMeR5YtY+td6ykQMtDYaJKJRpLoWywK7L9Da18IY9s7OxwTL8MwINJTHyUX97BTt2St37qQeV5+j6wGner5Ibr9AnYDhiv/jW5uWBmnw/wNWXHtu7CVAMQBg096qaQLeSTT6ToEcCy3D7bQeiHyebO7BcPVzA0JeCW3bxZ+exH29n2MYp5m/1h',
      body,
      attributes: {
        ApproximateReceiveCount: '',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: '',
      },
      messageAttributes: {},
      md5OfMessageAttributes: undefined,
      md5OfBody: 'e1f021a7390e5560c94bc48508e1a374',
      eventSource: 'aws:sqs',
      eventSourceARN:
        'arn:aws:sqs:us-west-2:739292628626:SpinServiceStack-processingqueueA47DA09A-SI4aP2T8qyDh',
      awsRegion: 'us-west-2',
    },
  ],
}

export type Cases = {
  mockEvent: Partial<APIGatewayProxyEvent>
  mockContext?: Partial<Context>
  expected: number
}

export const refreshBody = {
  platform: 'mobile',
  user_name: 'Jabhi@Jabhi.com',
}
