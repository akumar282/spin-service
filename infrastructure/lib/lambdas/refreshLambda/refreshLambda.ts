/* eslint-disable @typescript-eslint/naming-convention */
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cookies, extractCookies, getEnv } from '../../shared/utils'
import { apiResponse } from '../../apigateway/responses'

const cognitoClient = new CognitoIdentityProviderClient({
  maxAttempts: 3,
  region: 'us-west-2',
})

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (event.body && event.headers) {
    const body = JSON.parse(event.body)

    const clientId =
      body.platform === 'mobile'
        ? getEnv('MOBILE_CLIENT_ID')
        : getEnv('WEB_CLIENT_ID')

    const rawCookieHeader = event.headers?.cookie

    const cookie = extractCookies(rawCookieHeader)

    if (cookie.error) {
      return apiResponse('No refresh token provided', 500)
    }

    try {
      const refreshCommand = await cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          ClientId: clientId,
          AuthParameters: {
            USERNAME: body.Username,
            REFRESH_TOKEN: cookie.refreshToken,
          },
        })
      )
      if (refreshCommand.AuthenticationResult) {
        const { AccessToken, IdToken, RefreshToken } =
          refreshCommand.AuthenticationResult
        return apiResponse(
          'Login Successful',
          200,
          cookies(AccessToken, IdToken, RefreshToken)
        )
      }
    } catch (e) {
      return apiResponse('Session Expired', 401)
    }
  }
  return apiResponse('Invalid request', 500)
}
