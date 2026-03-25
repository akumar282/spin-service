import { mockClient } from 'aws-sdk-client-mock'
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import * as Utils from '../../../infrastructure/lib/shared/utils'
import { handler } from '../../../infrastructure/lib/lambdas/processingLambda'
import { sqsEvent, userTest } from '../../testData/constants'
import 'aws-sdk-client-mock-jest'

describe('processingLambda handler', () => {
  const dynamoDocumentMock = mockClient(DynamoDBDocumentClient)
  const dynamoClient = mockClient(DynamoDBClient)
  const sqsClient = mockClient(SQSClient)
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    process.env.LEDGER_TABLE = 'ledgerTable'
    process.env.USER = 'admin'
    process.env.DASHPASS = 'testpass'
    process.env.DOWNSTREAM_QUEUE_URL = 'https://sqs.example/downstream'
    process.env.OPENSEARCH_ENDPOINT = 'https://opensearch.example/'

    dynamoDocumentMock.reset()
    dynamoClient.reset()
    sqsClient.reset()

    jest.restoreAllMocks()
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('publishes users and marks ledger as PUBLISHED_USERS', async () => {
    dynamoDocumentMock.on(PutCommand).resolves({})
    dynamoDocumentMock.on(UpdateCommand).resolves({})

    sqsClient.on(SendMessageCommand).resolves({
      MessageId: 'message-1',
    })

    jest.spyOn(Utils, 'requestWithBody').mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: {
            hits: [{ _source: userTest }],
          },
        })
      )
    )

    const result = await handler(sqsEvent)

    expect(result).toEqual({ batchItemFailures: [] })
    expect(dynamoDocumentMock).toHaveReceivedCommand(PutCommand)
    expect(dynamoDocumentMock).toHaveReceivedCommand(UpdateCommand)
    expect(sqsClient).toHaveReceivedCommand(SendMessageCommand)

    const updateInput =
      dynamoDocumentMock.commandCalls(UpdateCommand)[0].args[0].input
    expect(updateInput).toEqual(
      expect.objectContaining({
        TableName: 'ledgerTable',
        ExpressionAttributeValues: expect.objectContaining({
          ':st': 'PUBLISHED_USERS',
          ':to': [],
        }),
      })
    )

    const sqsInput = sqsClient.commandCalls(SendMessageCommand)[0].args[0].input
    expect(sqsInput.QueueUrl).toBe('https://sqs.example/downstream')

    const parsedBody = JSON.parse(sqsInput.MessageBody ?? '{}')
    expect(parsedBody.data.recipients).toEqual([
      {
        id: userTest.id,
        email: userTest.email,
        phone: userTest.phone,
        notifyType: userTest.notifyType,
        countryCode: userTest.countryCode,
      },
    ])
  })

  test('marks ledger as NO_RECIPIENTS when OpenSearch returns no users', async () => {
    dynamoDocumentMock.on(PutCommand).resolves({})
    dynamoDocumentMock.on(UpdateCommand).resolves({})

    jest.spyOn(Utils, 'requestWithBody').mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: {
            hits: [],
          },
        })
      )
    )

    const result = await handler(sqsEvent)

    expect(result).toEqual({ batchItemFailures: [] })
    expect(sqsClient).not.toHaveReceivedCommand(SendMessageCommand)

    const updateInput =
      dynamoDocumentMock.commandCalls(UpdateCommand)[0].args[0].input
    expect(updateInput).toEqual(
      expect.objectContaining({
        ExpressionAttributeValues: expect.objectContaining({
          ':st': 'NO_RECIPIENTS',
          ':to': [],
        }),
      })
    )
  })

  test('returns batch failure when OpenSearch query fails', async () => {
    dynamoDocumentMock.on(PutCommand).resolves({})

    jest
      .spyOn(Utils, 'requestWithBody')
      .mockRejectedValue(new Error('OpenSearch down'))

    const result = await handler(sqsEvent)

    expect(result.batchItemFailures).toEqual([
      { itemIdentifier: sqsEvent.Records[0].messageId },
    ])
    expect(sqsClient).not.toHaveReceivedCommand(SendMessageCommand)
    expect(dynamoDocumentMock).not.toHaveReceivedCommand(UpdateCommand)
  })

  test('Skips duplicate items when ledger put condition fails', async () => {
    dynamoDocumentMock.on(PutCommand).rejects(
      new ConditionalCheckFailedException({
        message: 'duplicate item',
        $metadata: {},
      })
    )

    const requestSpy = jest.spyOn(Utils, 'requestWithBody')

    const result = await handler(sqsEvent)

    expect(result).toEqual({ batchItemFailures: [] })
    expect(requestSpy).not.toHaveBeenCalled()
    expect(sqsClient).not.toHaveReceivedCommand(SendMessageCommand)
  })

  test('Returns batch failure when ledger put fails with non-conditional error', async () => {
    dynamoDocumentMock.on(PutCommand).rejects(new Error('dynamo unavailable'))

    const result = await handler(sqsEvent)

    expect(result.batchItemFailures).toEqual([
      { itemIdentifier: sqsEvent.Records[0].messageId },
    ])
  })
})
