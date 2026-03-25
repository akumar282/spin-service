import { mockClient } from 'aws-sdk-client-mock'
import {
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from '../../../infrastructure/lib/lambdas/authLambda'
import 'aws-sdk-client-mock-jest'

describe('Auth Lambda Test', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient)
  const dynamoMock = mockClient(DynamoDBDocumentClient)
  const OLD_ENV = process.env

  const makeEvent = (
    event: Partial<APIGatewayProxyEvent>
  ): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
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
    process.env.MOBILE_CLIENT_ID = 'MOBILE_CLIENT_ID'
    process.env.WEB_CLIENT_ID = 'WEB_CLIENT_ID'
    process.env.USER_POOL_ID = 'USER_POOL_ID'
    process.env.TABLE_NAME = 'usersTable'
    process.env.CLOUD_DISTRO = 'https://idk.com'

    cognitoMock.reset()
    dynamoMock.reset()
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('creates a new user and logs in (mobile)', async () => {
    const username = 'Jabhi@Jabhi.com'
    const password = '111111'

    dynamoMock
      .on(PutCommand, {
        TableName: 'usersTable',
      })
      .resolves({
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
        username,
        password,
      },
    })

    const mockEvent: Partial<APIGatewayProxyEvent> = {
      body,
      headers: {
        origin: 'https://idk.com',
      },
    }

    const result = await handler(makeEvent(mockEvent))

    expect(dynamoMock).toHaveReceivedCommand(PutCommand)
    expect(cognitoMock).toHaveReceivedCommand(SignUpCommand)
    expect(cognitoMock).toHaveReceivedCommand(AdminConfirmSignUpCommand)
    expect(cognitoMock).toHaveReceivedCommand(InitiateAuthCommand)

    expect(cognitoMock.commandCalls(SignUpCommand)[0].args[0].input).toEqual(
      expect.objectContaining({
        ClientId: 'MOBILE_CLIENT_ID',
        Username: username,
        Password: password,
      })
    )
    expect(
      cognitoMock.commandCalls(AdminConfirmSignUpCommand)[0].args[0].input
    ).toEqual(
      expect.objectContaining({
        UserPoolId: 'USER_POOL_ID',
        Username: username,
      })
    )
    expect(dynamoMock.commandCalls(PutCommand)[0].args[0].input).toEqual(
      expect.objectContaining({
        TableName: 'usersTable',
        Item: expect.objectContaining({
          id: '1738',
          user_name: username,
          email: username,
          phone: '',
        }),
      })
    )

    expect(result.statusCode).toEqual(200)
    expect(result.multiValueHeaders?.['Set-Cookie']).toHaveLength(3)
    expect(result.headers?.['Access-Control-Allow-Origin']).toBe(
      'https://idk.com'
    )
    expect(JSON.parse(result.body)).toBe('Login Successful')
  })

  test('logs in existing web user with WEB_CLIENT_ID', async () => {
    const username = 'web-user@example.com'
    const password = 'abc123'

    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: {
        AccessToken: 'AccessToken',
        RefreshToken: 'RefreshToken',
        IdToken: 'IdToken',
      },
    })

    const body = JSON.stringify({
      type: 'login',
      platform: 'web',
      credentials: {
        username,
        password,
      },
    })

    const result = await handler(
      makeEvent({
        body,
        headers: {
          origin: 'https://idk.com',
        },
      })
    )

    expect(cognitoMock).toHaveReceivedCommandTimes(InitiateAuthCommand, 1)
    expect(
      cognitoMock.commandCalls(InitiateAuthCommand)[0].args[0].input
    ).toEqual(
      expect.objectContaining({
        ClientId: 'WEB_CLIENT_ID',
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      })
    )
    expect(result.statusCode).toEqual(200)
    expect(JSON.parse(result.body)).toBe('Login Successful')
  })

  test('returns 500 when CreateUser fails', async () => {
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

    dynamoMock.on(PutCommand).resolves({
      $metadata: {
        httpStatusCode: 500,
      },
    })

    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          type: 'new_user',
          platform: 'mobile',
          credentials: {
            username: 'Jabhi@Jabhi.com',
            password: '111111',
          },
        }),
        headers: {
          origin: 'https://idk.com',
        },
      })
    )

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toBe('User Creation Failure')
  })

  test('returns 400 when body is missing', async () => {
    const result = await handler(
      makeEvent({
        headers: {
          origin: 'https://idk.com',
        },
      })
    )

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toBe('Invalid Body Provided')
  })

  test('throws when body is invalid JSON', async () => {
    await expect(
      handler(
        makeEvent({
          body: '{not-json',
          headers: {
            origin: 'https://idk.com',
          },
        })
      )
    ).rejects.toThrow()
  })

  test('creates user with phone when username is not an email', async () => {
    const phone = '+14251234567'
    const password = '111111'

    cognitoMock
      .on(SignUpCommand)
      .resolves({
        UserConfirmed: false,
        UserSub: 'new-sub',
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
          RefreshToken: 'RefreshToken',
          IdToken: 'IdToken',
        },
      })

    dynamoMock.on(PutCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    })

    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          type: 'new_user',
          platform: 'mobile',
          credentials: {
            username: phone,
            password,
          },
        }),
        headers: {
          origin: 'https://idk.com',
        },
      })
    )

    expect(dynamoMock.commandCalls(PutCommand)[0].args[0].input).toEqual(
      expect.objectContaining({
        Item: expect.objectContaining({
          email: '',
          phone,
        }),
      })
    )
    expect(result.statusCode).toBe(200)
  })
})
