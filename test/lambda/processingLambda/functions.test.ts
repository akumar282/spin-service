import {
  createQuery,
  deleteSQSMessage,
  determineNotificationMethods,
  sendEmail,
  updateLedgerItem,
} from '../../../infrastructure/lib/lambdas/processingLambda/functions'
import {
  getEnv,
  requestWithBody,
} from '../../../infrastructure/lib/shared/utils'
import process from 'node:process'
import { record1, users } from './testConsts'
import { User } from '../../../infrastructure/lib/apigateway/types'
import { mockClient } from 'aws-sdk-client-mock'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import 'aws-sdk-client-mock-jest'

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

  test('Determine Notfication Methods Test', () => {
    const { email, phone, inapp } = determineNotificationMethods(
      users as User[]
    )
    expect(email.length).toEqual(3)
    expect(phone.length).toEqual(2)
    expect(inapp.length).toEqual(1)
  })

  test('Send Email Test', async () => {
    const { email } = determineNotificationMethods(users as User[])

    expect(email.length).toEqual(3)

    sesMock.on(SendEmailCommand).resolves({
      MessageId: 'EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000',
    })

    const result = await sendEmail(new SESClient({}), email, record1)
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

    const result = await updateLedgerItem(
      DynamoDBDocumentClient.from(
        new DynamoDBClient({
          retryMode: 'standard',
          maxAttempts: 3,
        })
      ),
      users as User[],
      'testId'
    )

    expect(dynamoDocumentMock).toHaveReceivedCommand(UpdateCommand)
    expect(dynamoDocumentMock).toHaveReceivedCommandWith(UpdateCommand, {
      TableName: 'ledgerTable',
      Key: { id: 'testId' },
      ExpressionAttributeNames: {
        '#st': 'status',
        '#pr': 'processed',
        '#to': 'to',
      },
      ExpressionAttributeValues: expect.objectContaining({
        ':st': 'COMPLETED',
        ':pr': true,
        ':to': users,
      }),
      UpdateExpression: 'SET #st = :st, #pr = :pr, #to = :to',
      ReturnValues: 'ALL_NEW',
    })

    expect(result).toEqual(expected)
  })
})
