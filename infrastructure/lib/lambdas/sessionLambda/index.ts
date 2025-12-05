import { APIGatewayProxyEvent } from 'aws-lambda'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { cookies, getEnv } from '../../shared/utils'
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model'
import { ResponseBuilder } from '../../apigateway/response'

export async function handler(event: APIGatewayProxyEvent) {
  const response = new ResponseBuilder('').addCors(event.headers.origin)
  const cookie = event.headers.Cookie
  if (event.path === '/public/session') {
    if (cookie) {
      const verifier = CognitoJwtVerifier.create({
        clientId: [getEnv('WEB_CLIENT_ID'), getEnv('MOBILE_CLIENT_ID')],
        userPoolId: getEnv('USER_POOL_ID'),
        tokenUse: 'id',
      })

      const parsed = Object.fromEntries(
        cookie.split(';').map((cookie) => {
          const [key, value] = cookie.trim().split('=')
          return [key, decodeURIComponent(value)]
        })
      )

      if (parsed.idToken === undefined || parsed.idToken === null) {
        return response.addBody('deny').addStatus(400).build()
      }

      const data: CognitoIdTokenPayload = await verifier.verify(parsed.idToken)
      if (data['custom:role'] === 'user' && data.exp * 1000 > Date.now()) {
        const data = Buffer.from(parsed.idToken).toString('base64')
        return response.addBody({ token: data }).addStatus(200).build()
      } else {
        return response.addBody('deny').addStatus(400).build()
      }
    }
  }
  if (event.path === '/public/session/logout') {
    return response
      .addStatus(200)
      .addCookies(cookies('none', 'none', 'none'))
      .build()
  }
  return response.addBody('deny').addStatus(404).build()
}
