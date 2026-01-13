import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
  Context,
} from 'aws-lambda'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import 'aws-sdk-client-mock-jest'
import { handler } from '../../../infrastructure/lib/lambdas/rawDataIngestion'
import { Cases, item, postTestConst } from '../../testData/constants'

const testCases: Cases[] = [
  {
    mockEvent: {
      body: JSON.stringify(item),
      path: '/raw',
      httpMethod: 'POST',
    },
    mockContext: {
      logGroupName: 'mockLogGroupName',
    },
    expected: 200,
  },
  {
    mockEvent: {
      body: JSON.stringify(item),
      path: '/raw/{id}',
      httpMethod: 'GET',
      pathParameters: {
        id: item.postId,
      },
    },
    mockContext: {
      logGroupName: 'mockLogGroupName',
    },
    expected: 200,
  },
]

describe('Raw data handler test cases', () => {
  const dynamoMock = mockClient(DynamoDBDocumentClient)

  beforeEach(() => {
    dynamoMock.reset()
  })

  test.each(testCases)(
    'Handler CRUD test',
    async ({ mockEvent, mockContext, expected }) => {
      process.env.TABLE_NAME = 'recordsTableNew'
      dynamoMock
        .on(PutCommand)
        .resolves({
          Attributes: item,
          $metadata: {
            httpStatusCode: 200,
          },
        })
        .on(QueryCommand)
        .resolves({
          Items: [item],
          $metadata: {
            httpStatusCode: 200,
          },
        })
        .on(DeleteCommand, {
          Key: {
            postId: item.postId,
            created_time: item.created_time,
          },
        })
        .resolves({
          $metadata: {
            httpStatusCode: 200,
          },
        })
        .on(UpdateCommand)
        .resolves({
          Attributes: item,
          $metadata: {
            httpStatusCode: 200,
          },
        })

      const result = await handler(
        <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>(
          mockEvent
        )
      )

      if (mockEvent.httpMethod === 'POST') {
        expect(dynamoMock).toHaveReceivedCommand(PutCommand)
      }

      if (mockEvent.httpMethod === 'GET') {
        expect(dynamoMock).toHaveReceivedCommand(QueryCommand)
      }

      if (mockEvent.httpMethod === 'DELETE') {
        expect(dynamoMock).toHaveReceivedCommand(DeleteCommand)
      }

      expect(result.statusCode).toEqual(expected)
    }
  )
})

test('[IT] Lambda Test', async () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    body: JSON.stringify(postTestConst),
    path: '/raw',
    httpMethod: 'POST',
  }

  const mockContext: Partial<Context> = {
    logGroupName: 'mockLogGroupName',
  }

  const result = await handler(
    <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>mockEvent
  )
  expect(result.statusCode).toEqual(200)
}, 30)
