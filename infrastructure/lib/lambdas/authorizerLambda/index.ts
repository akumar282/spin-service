import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { getEnv } from '../../shared/utils'
import { generatePolicy } from './functions'
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model'

export async function handler(
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> {
  let token
  if (event.headers?.Authorization) {
    token = event.headers.Authorization.replace('Bearer', '')
  } else if (event.headers?.Cookie) {
    const cookies = event.headers.Cookie
    const parsed = Object.fromEntries(
      cookies.split(';').map((cookie) => {
        const [key, value] = cookie.trim().split('=')
        return [key, decodeURIComponent(value)]
      })
    )
    token = parsed.id
  } else {
    return generatePolicy(
      'User',
      'Deny',
      event.methodArn
    ) as APIGatewayAuthorizerResult
  }
  const verifier = CognitoJwtVerifier.create({
    clientId: [getEnv('WEB_CLIENT_ID'), getEnv('MOBILE_CLIENT_ID')],
    userPoolId: getEnv('USER_POOL_ID'),
    tokenUse: 'id',
  })
  try {
    const payload: CognitoIdTokenPayload = await verifier.verify(token)
    if (payload['custom:role'] === 'user' && payload.exp * 1000 > Date.now()) {
      return generatePolicy(
        payload.sub,
        'Allow',
        event.methodArn
      ) as APIGatewayAuthorizerResult
    } else {
      return generatePolicy(
        payload.sub,
        'Deny',
        event.methodArn
      ) as APIGatewayAuthorizerResult
    }
  } catch (e) {
    console.error(`Authorizer failed with: ${e}`)
  }
  return generatePolicy(
    'User',
    'Deny',
    event.methodArn
  ) as APIGatewayAuthorizerResult
}
