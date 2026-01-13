import { mockClient } from 'aws-sdk-client-mock'
import {
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
} from 'aws-lambda'
import { handler } from '../../../infrastructure/lib/lambdas/authLambda'
import 'aws-sdk-client-mock-jest'

describe('Auth Lambda Test', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient)
  const dynamoMock = mockClient(DynamoDBDocumentClient)

  beforeEach(() => {
    cognitoMock.reset()
    dynamoMock.reset()
  })

  test('Handler Mock Test', async () => {
    process.env.MOBILE_CLIENT_ID = 'MOBILE_CLIENT_ID'
    process.env.WEB_CLIENT_ID = 'WEB_CLIENT_ID'
    process.env.USER_POOL_ID = 'USER_POOL_ID'
    process.env.TABLE_NAME = 'usersTable'
    process.env.CLOUD_DISTRO = 'https://idk.com'

    dynamoMock
      .on(PutCommand, {
        TableName: 'usersTable',
      })
      .resolves({
        Attributes: {
          id: '4',
          user_name: 'Jabhi@Jabhi.com',
          email: 'Jabhi@Jabhi.com',
          phone: '',
          notifyType: [],
          genres: [],
          labels: [],
          artists: [],
          albums: [],
        },
        $metadata: {
          httpStatusCode: 200,
        },
      })

    cognitoMock
      .on(SignUpCommand)
      .resolves({
        UserConfirmed: false,
        UserSub: '1738',
      })
      .on(AdminConfirmSignUpCommand)
      .resolves({
        $metadata: {
          httpStatusCode: 200,
        },
      })
      .on(InitiateAuthCommand)
      .resolves({
        AuthenticationResult: {
          AccessToken: 'AccessToken',
          TokenType: 'Bearer',
          RefreshToken: 'RefreshToken',
          IdToken: 'IdToken',
        },
      })

    const body = JSON.stringify({
      type: 'new_user',
      platform: 'mobile',
      credentials: {
        username: 'Jabhi@Jabhi.com',
        password: '111111',
      },
    })

    const mockEvent: Partial<APIGatewayProxyEvent> = {
      body,
      headers: {
        origin: 'https://idk.com',
      },
    }

    const result = await handler(
      <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>(
        mockEvent
      )
    )

    expect(dynamoMock).toHaveReceivedCommand(PutCommand)
    expect(cognitoMock).toHaveReceivedCommand(SignUpCommand)
    expect(cognitoMock).toHaveReceivedCommand(AdminConfirmSignUpCommand)
    expect(cognitoMock).toHaveReceivedCommand(InitiateAuthCommand)

    expect(result.statusCode).toEqual(200)
  })
})
