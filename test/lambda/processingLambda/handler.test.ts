import { mockClient } from 'aws-sdk-client-mock'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import * as Utils from '../../../infrastructure/lib/shared/utils'
import { Records, SQSBody } from '../../../infrastructure/lib/apigateway/types'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { handler } from '../../../infrastructure/lib/lambdas/processingLambda'
import { Context } from 'aws-lambda'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import process from 'node:process'
import 'aws-sdk-client-mock-jest'
import { sqsEvent, userTest, wrappedReturn } from '../../testData/constants'

describe('Test for procesing handler', () => {
  const sesMock = mockClient(SESClient)
  const dynamoDocumentMock = mockClient(DynamoDBDocumentClient)
  const dynamoClient = mockClient(DynamoDBClient)
  const sqsClient = mockClient(SQSClient)
  const ssmMock = mockClient(SSMClient)

  beforeEach(() => {
    sesMock.reset()
    dynamoDocumentMock.reset()
    dynamoClient.reset()
    sqsClient.reset()
    ssmMock.reset()
  })

  test('Handler mock test', async () => {
    process.env.LEDGER_TABLE = 'ledgerTable'
    process.env.USER = 'admin'
    process.env.DASHPASS = 'testpass'
    process.env.SQS_URL = 'testurl'
    jest.spyOn(Utils, 'requestWithBody').mockResolvedValue(wrappedReturn)
    dynamoDocumentMock
      .on(PutCommand, {
        TableName: 'ledgerTable',
      })
      .resolves({
        Attributes: {
          postId: 't3_1jtink0',
          status: 'STARTED',
          processed: false,
          to: [],
          ttl: Math.floor(Date.now() / 1000) + 86400,
        },
      })
      .on(UpdateCommand, {
        TableName: 'ledgerTable',
      })
      .resolves({
        Attributes: {
          postId: 't3_1jtink0',
          status: 'COMPLETED',
          processed: true,
          to: [userTest],
          ttl: Date.now(),
        },
      })

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: '/os/endpoint',
        Value:
          'https://r0v2604715.execute-api.us-west-2.amazonaws.com/prod/os/',
      },
    })

    sesMock.on(SendEmailCommand).resolves({
      MessageId: 'EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000',
    })

    sqsClient.on(DeleteMessageCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    })

    const mockContext: Partial<Context> = {
      logGroupName: 'mockLogGroupName',
    }

    const result = await handler(sqsEvent, <Context>mockContext)
    expect(ssmMock).toHaveReceivedCommand(GetParameterCommand)
    expect(dynamoDocumentMock).toHaveReceivedCommand(PutCommand)
    expect(sesMock).toHaveReceivedCommand(SendEmailCommand)
    expect(sqsClient).toHaveReceivedCommand(DeleteMessageCommand)
    expect(dynamoDocumentMock).toHaveReceivedCommand(UpdateCommand)

    expect(dynamoDocumentMock).toHaveReceivedCommandWith(UpdateCommand, {
      TableName: 'ledgerTable',
      Key: { id: 't3_1jtink0' },
      ExpressionAttributeNames: {
        '#st': 'status',
        '#pr': 'processed',
        '#to': 'to',
      },
      ExpressionAttributeValues: expect.objectContaining({
        ':st': 'COMPLETED',
        ':pr': true,
        ':to': [userTest],
      }),
      UpdateExpression: 'SET #st = :st, #pr = :pr, #to = :to',
      ReturnValues: 'ALL_NEW',
    })

    expect(result.statusCode).toEqual(200)
  })

  test('Deserialize logic test', () => {
    const eventRecords: SQSBody[] = sqsEvent.Records.map((record) => {
      const data = JSON.parse(record.body) as SQSBody
      data.receiptHandle = record.receiptHandle
      return data
    })

    for (const eventRecord of eventRecords) {
      const item = eventRecord.dynamodb.NewImage
      const unmarshalled = unmarshall(item) as Records
      console.info(unmarshalled)
    }
  })
})
