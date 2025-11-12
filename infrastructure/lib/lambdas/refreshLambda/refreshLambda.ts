/* eslint-disable @typescript-eslint/naming-convention */
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cookies, extractCookies, getEnv } from '../../shared/utils'
import { ResponseBuilder } from '../../apigateway/response'

const cognitoClient = new CognitoIdentityProviderClient({
  maxAttempts: 3,
  region: 'us-west-2',
})

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log(event)
  const response = new ResponseBuilder('').addCors(event.headers.origin)
  if (event.body && event.headers) {
    const body = JSON.parse(event.body)

    const clientId =
      body.platform === 'mobile'
        ? getEnv('MOBILE_CLIENT_ID')
        : getEnv('WEB_CLIENT_ID')

    const rawCookieHeader = event.headers?.Cookie
    const cookie = extractCookies(rawCookieHeader)
    if (cookie.error) {
      return response
        .addBody('No Refresh Token Provided')
        .addStatus(500)
        .build()
    }

    try {
      const refreshCommand = await cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          ClientId: clientId,
          AuthParameters: {
            USERNAME: body.user_name,
            REFRESH_TOKEN: cookie.refreshToken,
          },
        })
      )
      if (refreshCommand.AuthenticationResult) {
        let { AccessToken, IdToken, RefreshToken } =
          refreshCommand.AuthenticationResult
        console.log(RefreshToken)
        if (RefreshToken === undefined) {
          RefreshToken = cookie.refreshToken
        }
        return response
          .addBody('Login Successful')
          .addStatus(200)
          .addCookies(cookies(AccessToken, IdToken, RefreshToken))
          .build()
      }
    } catch (e) {
      return response.addBody('Session Expired').addStatus(401).build()
    }
  }
  return response.addBody('Invalid Request').addStatus(500).build()
}
