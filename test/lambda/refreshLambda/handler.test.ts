import { APIGatewayProxyEvent } from 'aws-lambda'
import { mockClient } from 'aws-sdk-client-mock'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { handler } from '../../../infrastructure/lib/lambdas/refreshLambda'
import 'aws-sdk-client-mock-jest'

describe('Refresh Lambda handler', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient)
  const OLD_ENV = process.env

  const makeEvent = (
    event: Partial<APIGatewayProxyEvent>
  ): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/refresh',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: '/refresh',
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    ...event,
  })

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    process.env.MOBILE_CLIENT_ID = 'MOBILE_CLIENT_ID'
    process.env.WEB_CLIENT_ID = 'WEB_CLIENT_ID'
    process.env.CLOUD_DISTRO = 'https://idk.com'

    cognitoMock.reset()
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('refreshes session for mobile and sets cookies', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: {
        AccessToken: 'new-access',
        IdToken: 'new-id',
        RefreshToken: 'new-refresh',
      },
    })

    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          platform: 'mobile',
          user_name: 'Jabhi@Jabhi.com',
        }),
        headers: {
          origin: 'https://idk.com',
          Cookie: 'refreshToken=old-refresh; HttpOnly; Secure',
        },
      })
    )

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toBe('Login Successful')
    expect(result.multiValueHeaders?.['Set-Cookie']).toHaveLength(3)

    const cmdInput =
      cognitoMock.commandCalls(InitiateAuthCommand)[0].args[0].input
    expect(cmdInput).toEqual(
      expect.objectContaining({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: 'MOBILE_CLIENT_ID',
        AuthParameters: {
          USERNAME: 'Jabhi@Jabhi.com',
          REFRESH_TOKEN: 'old-refresh',
        },
      })
    )
  })

  test('uses cookie refresh token when Cognito does not return one', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: {
        AccessToken: 'new-access',
        IdToken: 'new-id',
      },
    })

    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          platform: 'web',
          user_name: 'web-user@example.com',
        }),
        headers: {
          origin: 'https://idk.com',
          Cookie: 'refreshToken=fallback-refresh; HttpOnly; Secure',
        },
      })
    )

    expect(result.statusCode).toBe(200)

    const cookies = result.multiValueHeaders?.['Set-Cookie'] ?? []
    expect(cookies.join(';')).toContain('refreshToken=fallback-refresh')

    const cmdInput =
      cognitoMock.commandCalls(InitiateAuthCommand)[0].args[0].input
    expect(cmdInput.ClientId).toBe('WEB_CLIENT_ID')
  })

  test('returns 500 when refresh token cookie is missing', async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          platform: 'mobile',
          user_name: 'Jabhi@Jabhi.com',
        }),
        headers: {
          origin: 'https://idk.com',
        },
      })
    )

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toBe('No Refresh Token Provided')
    expect(cognitoMock).not.toHaveReceivedCommand(InitiateAuthCommand)
  })

  test('returns 401 when Cognito refresh fails', async () => {
    cognitoMock.on(InitiateAuthCommand).rejects(new Error('expired'))

    const result = await handler(
      makeEvent({
        body: JSON.stringify({
          platform: 'mobile',
          user_name: 'Jabhi@Jabhi.com',
        }),
        headers: {
          origin: 'https://idk.com',
          Cookie: 'refreshToken=old-refresh; HttpOnly; Secure',
        },
      })
    )

    expect(result.statusCode).toBe(401)
    expect(JSON.parse(result.body)).toBe('Session Expired')
  })

  test('returns 500 for invalid request when body is missing', async () => {
    const result = await handler(
      makeEvent({
        body: null,
        headers: {
          origin: 'https://idk.com',
        },
      })
    )

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toBe('Invalid Request')
  })
})
