import { Cases, refreshBody } from '../../testData/constants'
import { mockClient } from 'aws-sdk-client-mock'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { handler } from '../../../infrastructure/lib/lambdas/refreshLambda'
import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
} from 'aws-lambda'

const testCases: Cases[] = [
  {
    mockEvent: {
      path: '/user/{id}',
      httpMethod: 'GET',
      body: JSON.stringify(refreshBody),
      pathParameters: {
        id: 'userTest.id',
      },
      headers: {
        cookie:
          'refreshToken=12345; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=2592000',
      },
    },
    expected: 200,
  },
]
describe('Refresh Token Test', () => {
  process.env.MOBILE_CLIENT_ID = 'MOBILE_CLIENT_ID'
  process.env.WEB_CLIENT_ID = 'WEB_CLIENT_ID'
  process.env.USER_POOL_ID = 'USER_POOL_ID'

  const cognitoMock = mockClient(CognitoIdentityProviderClient)

  beforeEach(() => {
    cognitoMock.reset()
  })

  test.each(testCases)(
    'Handler refresh test',
    async ({ mockEvent, expected }) => {
      cognitoMock.on(InitiateAuthCommand).resolves({
        AuthenticationResult: {
          AccessToken: 'AccessToken',
          TokenType: 'Bearer',
          RefreshToken: 'RefreshToken',
          IdToken: 'IdToken',
        },
      })

      const result = await handler(
        <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>(
          mockEvent
        )
      )

      expect(result.statusCode).toEqual(expected)
    }
  )
})
