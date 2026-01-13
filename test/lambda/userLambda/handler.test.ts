import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { Cases, userTest } from '../../testData/constants'
import { handler } from '../../../infrastructure/lib/lambdas/userLambda'
import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
} from 'aws-lambda'
import 'aws-sdk-client-mock-jest'
import process from 'node:process'

const testCases: Cases[] = [
  {
    mockEvent: {
      body: JSON.stringify(userTest),
      path: '/user/{id}',
      httpMethod: 'PATCH',
      pathParameters: {
        id: userTest.id,
      },
      headers: {
        origin: 'https://local',
      },
    },
    expected: 200,
  },
  {
    mockEvent: {
      path: '/user/{id}',
      httpMethod: 'GET',
      pathParameters: {
        id: userTest.id,
      },
      headers: {
        origin: 'https://local',
      },
    },
    expected: 200,
  },
]

describe('User handler test cases', () => {
  const dynamoMock = mockClient(DynamoDBDocumentClient)
  const cognitoMock = mockClient(CognitoIdentityProviderClient)

  beforeEach(() => {
    dynamoMock.reset()
    cognitoMock.reset()
  })

  test.each(testCases)('Handler CRUD test', async ({ mockEvent, expected }) => {
    process.env.TABLE_NAME = 'usersTable'
    process.env.USER_POOL_ID = '5'
    process.env.CLOUD_DISTRO = 'https://idk.com'

    dynamoMock
      .on(QueryCommand)
      .resolves({
        Items: [userTest],
        $metadata: {
          httpStatusCode: 200,
        },
      })
      .on(UpdateCommand)
      .resolves({
        Attributes: userTest,
        $metadata: {
          httpStatusCode: 200,
        },
      })

    cognitoMock.on(AdminUpdateUserAttributesCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    })

    const result = await handler(
      <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>(
        mockEvent
      )
    )

    if (mockEvent.httpMethod === 'PATCH') {
      expect(dynamoMock).toHaveReceivedCommand(UpdateCommand)
    }

    if (mockEvent.httpMethod === 'GET') {
      expect(dynamoMock).toHaveReceivedCommand(QueryCommand)
    }

    expect(result.statusCode).toEqual(expected)
  })
})
