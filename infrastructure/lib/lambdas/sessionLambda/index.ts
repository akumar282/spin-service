import { APIGatewayProxyEvent } from 'aws-lambda'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { getEnv } from '../../shared/utils'
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model'
import { apiResponse } from '../../apigateway/responses'

export async function handler(event: APIGatewayProxyEvent) {
  const cookies = event.headers.Cookie
  console.log(cookies)
  if (cookies) {
    const verifier = CognitoJwtVerifier.create({
      clientId: [getEnv('WEB_CLIENT_ID'), getEnv('MOBILE_CLIENT_ID')],
      userPoolId: getEnv('USER_POOL_ID'),
      tokenUse: 'id',
    })

    const parsed = Object.fromEntries(
      cookies.split(';').map((cookie) => {
        const [key, value] = cookie.trim().split('=')
        return [key, decodeURIComponent(value)]
      })
    )
    console.log(parsed)

    const data: CognitoIdTokenPayload = await verifier.verify(parsed.idToken)
    if (data['custom:role'] === 'user' && data.exp * 1000 > Date.now()) {
      const data = Buffer.from(parsed.idToken).toString('base64')
      return apiResponse(
        { token: data },
        200,
        undefined,
        true,
        event.headers.origin
      )
    } else {
      return apiResponse('deny', 401, undefined, true, event.headers.origin)
    }
  }
  return apiResponse('deny', 404, undefined, true, event.headers.origin)
}
