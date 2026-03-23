import { createQuery } from '../../../infrastructure/lib/lambdas/processingLambda/functions'
import {
  deleteSQSMessage,
  getEnv,
  requestWithBody,
  updateLedgerItem,
} from '../../../infrastructure/lib/shared/utils'
import process from 'node:process'
import { User, Records } from '../../../infrastructure/lib/apigateway/types'
import { mockClient } from 'aws-sdk-client-mock'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { record1, users } from '../../testData/constants'
import 'aws-sdk-client-mock-jest'
import {
  determineNotificationMethods,
  sendEmail,
} from '../../../infrastructure/lib/lambdas/notificationLambda/functions'

describe('Assorted test for functions', () => {
  const sesMock = mockClient(SESClient)
  const dynamoDocumentMock = mockClient(DynamoDBDocumentClient)
  const dynamoClient = mockClient(DynamoDBClient)
  const sqsClient = mockClient(SQSClient)

  beforeEach(() => {
    sesMock.reset()
    dynamoDocumentMock.reset()
    dynamoClient.reset()
    sqsClient.reset()
  })

  test('Will generate correct open search query', async () => {
    const result = createQuery(
      'PinkPantheress',
      'Fancy That',
      'Vinyl',
      'PinkPantheress - Fancy That',
      ['R&B', 'Pop']
    )
    expect(result).toEqual({
      query: {
        bool: {
          minimum_should_match: 1,
          should: [
            {
              nested: {
                path: 'albums',
                query: {
                  bool: {
                    filter: [
                      {
                        term: {
                          'albums.type': 'Vinyl',
                        },
                      },
                    ],
                    must: [
                      {
                        bool: {
                          minimum_should_match: 1,
                          should: [
                            {
                              match_phrase: {
                                'albums.album': {
                                  query: 'PinkPantheress - Fancy That',
                                  slop: 2,
                                  boost: 6,
                                },
                              },
                            },
                            {
                              match: {
                                'albums.album': {
                                  query: 'PinkPantheress - Fancy That',
                                  fuzziness: 'AUTO',
                                  prefix_length: 2,
                                  max_expansions: 50,
                                  minimum_should_match: '3<75%',
                                  boost: 2,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              nested: {
                path: 'artists',
                query: {
                  match: {
                    'artists.artist': {
                      query: 'PinkPantheress',
                      fuzziness: 'AUTO',
                      prefix_length: 1,
                    },
                  },
                },
              },
            },
            {
              match: {
                custom: {
                  query: 'PinkPantheress - Fancy That',
                  fuzziness: 'AUTO',
                  minimum_should_match: '2<75%',
                },
              },
            },

            {
              term: {
                genres: 'R&B',
              },
            },

            {
              term: {
                genres: 'Pop',
              },
            },
          ],
        },
      },
    })
  })

  test('Will make no list', async () => {
    const result = createQuery(
      'PinkPantheress',
      'Fancy That',
      'Vinyl',
      'PinkPantheress - Fancy That',
      []
    )
    expect(result).toEqual({
      query: {
        bool: {
          minimum_should_match: 1,
          should: [
            {
              nested: {
                path: 'albums',
                query: {
                  bool: {
                    filter: [
                      {
                        term: {
                          'albums.type': 'Vinyl',
                        },
                      },
                    ],
                    must: [
                      {
                        bool: {
                          minimum_should_match: 1,
                          should: [
                            {
                              match_phrase: {
                                'albums.album': {
                                  query: 'PinkPantheress - Fancy That',
                                  slop: 2,
                                  boost: 6,
                                },
                              },
                            },
                            {
                              match: {
                                'albums.album': {
                                  query: 'PinkPantheress - Fancy That',
                                  fuzziness: 'AUTO',
                                  prefix_length: 2,
                                  max_expansions: 50,
                                  minimum_should_match: '3<75%',
                                  boost: 2,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              nested: {
                path: 'artists',
                query: {
                  match: {
                    'artists.artist': {
                      query: 'PinkPantheress',
                      fuzziness: 'AUTO',
                      prefix_length: 1,
                    },
                  },
                },
              },
            },
            {
              match: {
                custom: {
                  query: 'PinkPantheress - Fancy That',
                  fuzziness: 'AUTO',
                  minimum_should_match: '2<75%',
                },
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
      'https://search-spin-data-naf233edf778repl34opf5lrq.us-west-2.es.amazonaws.com/'

    const userQueryBody = createQuery(
      'PinkPantheress',
      'Fancy That',
      'vinyl',
      'PinkPantheress - Fancy That',
      []
    )
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

  test('Determine Notfication Methods Test', () => {
    const { email, phone, inapp } = determineNotificationMethods(
      users as User[]
    )
    expect(email.length).toEqual(3)
    expect(phone.length).toEqual(2)
    expect(inapp.length).toEqual(1)
  })

  test.skip('Send Email Test', async () => {
    const { email } = determineNotificationMethods(users as User[])

    expect(email.length).toEqual(3)

    sesMock.on(SendEmailCommand).resolves({
      MessageId: 'EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000',
    })

    const result = await sendEmail(new SESClient({}), email, record1 as Records)
    expect(result).toEqual({
      MessageId: 'EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000',
    })
  })

  test('Sqs Delete Test', async () => {
    process.env.SQS_URL = 'https://sqsurl.com'

    sqsClient.on(DeleteMessageCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    })

    const result = await deleteSQSMessage('Handle', new SQSClient({}))
    expect(result).toEqual({
      $metadata: {
        httpStatusCode: 200,
      },
    })
  })

  test('Ledger Table test', async () => {
    process.env.LEDGER_TABLE = 'ledgerTable'

    const expected = {
      Attributes: {
        postId: 'testId',
        status: 'COMPLETED',
        processed: true,
        to: users,
        ttl: '',
      },
    }

    dynamoDocumentMock
      .on(UpdateCommand, {
        TableName: 'ledgerTable',
      })
      .resolves(expected)
    const ids = users.map((x) => x.id)
    const result = await updateLedgerItem(
      DynamoDBDocumentClient.from(
        new DynamoDBClient({
          retryMode: 'standard',
          maxAttempts: 3,
        })
      ),
      ids,
      'testId'
    )

    expect(dynamoDocumentMock).toHaveReceivedCommand(UpdateCommand)
    expect(dynamoDocumentMock).toHaveReceivedCommandWith(UpdateCommand, {
      TableName: 'ledgerTable',
      Key: { postId: 'testId' },
      ExpressionAttributeNames: {
        '#st': 'status',
        '#pr': 'processed',
        '#to': 'to',
      },
      ExpressionAttributeValues: expect.objectContaining({
        ':st': 'COMPLETED',
        ':pr': true,
        ':to': ids,
      }),
      UpdateExpression: 'SET #st = :st, #pr = :pr, #to = :to',
      ReturnValues: 'ALL_NEW',
    })

    expect(result).toEqual(expected)
  })
})
