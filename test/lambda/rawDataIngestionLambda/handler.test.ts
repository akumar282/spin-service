import { APIGatewayProxyEvent } from 'aws-lambda'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import 'aws-sdk-client-mock-jest'
import { handler } from '../../../infrastructure/lib/lambdas/rawDataIngestion'
import { item } from '../../testData/constants'

describe('Raw data ingestion handler', () => {
  const dynamoDocMock = mockClient(DynamoDBDocumentClient)
  const dynamoClientMock = mockClient(DynamoDBClient)
  const OLD_ENV = process.env

  const makeEvent = (
    event: Partial<APIGatewayProxyEvent>
  ): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: '/',
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    ...event,
  })

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    process.env.TABLE_NAME = 'recordsTableNew'
    process.env.UPCOMING_TABLE = 'upcomingTable'

    dynamoDocMock.reset()
    dynamoClientMock.reset()
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('POST /raw stores a record', async () => {
    dynamoDocMock
      .on(PutCommand)
      .resolves({ $metadata: { httpStatusCode: 200 } })

    const result = await handler(
      makeEvent({
        resource: '/raw',
        path: '/raw',
        httpMethod: 'POST',
        body: JSON.stringify(item),
      })
    )

    expect(result.statusCode).toBe(200)
    expect(dynamoDocMock).toHaveReceivedCommand(PutCommand)
    expect(dynamoDocMock.commandCalls(PutCommand)[0].args[0].input).toEqual(
      expect.objectContaining({
        TableName: 'recordsTableNew',
        ConditionExpression: 'attribute_not_exists(postId)',
        Item: item,
      })
    )
  })

  test('POST /raw returns 400 when body is missing', async () => {
    const result = await handler(
      makeEvent({
        resource: '/raw',
        path: '/raw',
        httpMethod: 'POST',
        body: null,
      })
    )

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toBe('Bad Request')
    expect(dynamoDocMock).not.toHaveReceivedCommand(PutCommand)
  })

  test('GET /raw/{id} returns item', async () => {
    dynamoDocMock.on(QueryCommand).resolves({
      Items: [item],
      $metadata: { httpStatusCode: 200 },
    })

    const result = await handler(
      makeEvent({
        resource: '/raw/{id}',
        path: `/raw/${item.postId}`,
        httpMethod: 'GET',
        pathParameters: { id: item.postId },
      })
    )

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({ data: item })
  })

  test('DELETE /raw/{id} returns 404 when item is missing', async () => {
    dynamoDocMock.on(QueryCommand).resolves({})

    const result = await handler(
      makeEvent({
        resource: '/raw/{id}',
        path: `/raw/${item.postId}`,
        httpMethod: 'DELETE',
        pathParameters: { id: item.postId },
      })
    )

    expect(result.statusCode).toBe(404)
    expect(JSON.parse(result.body)).toEqual({
      data: `No Item found with id: ${item.postId}`,
    })
  })

  test('PATCH /raw/{id} updates a record', async () => {
    dynamoDocMock.on(QueryCommand).resolves({
      Items: [item],
      $metadata: { httpStatusCode: 200 },
    })

    dynamoClientMock.on(UpdateCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      Attributes: {
        ...item,
        title: 'New title',
      },
    })

    const result = await handler(
      makeEvent({
        resource: '/raw/{id}',
        path: `/raw/${item.postId}`,
        httpMethod: 'PATCH',
        pathParameters: { id: item.postId },
        body: JSON.stringify({
          title: 'New title',
          artist: item.artist,
          year: '2024',
          media: 'vinyl',
        }),
      })
    )

    expect(result.statusCode).toBe(200)
    expect(dynamoClientMock).toHaveReceivedCommand(UpdateCommand)
    expect(
      dynamoClientMock.commandCalls(UpdateCommand)[0].args[0].input
    ).toEqual(
      expect.objectContaining({
        TableName: 'recordsTableNew',
        Key: {
          postId: item.postId,
          created_time: item.created_time,
        },
      })
    )
  })

  test('POST /raw/upcoming stores upcoming item', async () => {
    dynamoDocMock
      .on(PutCommand)
      .resolves({ $metadata: { httpStatusCode: 200 } })

    const upcoming = { artist: 'A', album: 'B', note: 'soon' }

    const result = await handler(
      makeEvent({
        resource: '/raw/upcoming',
        path: '/raw/upcoming',
        httpMethod: 'POST',
        body: JSON.stringify(upcoming),
      })
    )

    expect(result.statusCode).toBe(200)
    expect(dynamoDocMock.commandCalls(PutCommand)[0].args[0].input).toEqual(
      expect.objectContaining({
        TableName: 'upcomingTable',
        ConditionExpression: 'attribute_not_exists(id)',
        Item: upcoming,
      })
    )
  })

  test('Returns 400 for unknown route', async () => {
    const result = await handler(
      makeEvent({
        resource: '/unknown',
        path: '/unknown',
        httpMethod: 'GET',
      })
    )

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toBe('Default')
  })
})
