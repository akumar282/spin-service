// import {
//   APIGatewayAuthorizerResult,
//   APIGatewayTokenAuthorizerEvent,
// } from 'aws-lambda'
// import { CognitoJwtVerifier } from 'aws-jwt-verify'
// import { getEnv } from '../../shared/utils'
// import { generatePolicy } from './functions'
// import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model'
//
// export async function handler(
//   event: APIGatewayTokenAuthorizerEvent
// ): Promise<APIGatewayAuthorizerResult> {
//   const token = event.authorizationToken
//   const verifier = CognitoJwtVerifier.create({
//     clientId: [getEnv('WEB_CLIENT_ID'), getEnv('MOBILE_CLIENT_ID')],
//     userPoolId: getEnv('USER_POOL_ID'),
//     tokenUse: 'id',
//   })
//   try {
//     const payload: CognitoIdTokenPayload = await verifier.verify(token)
//     if (payload['custom:role'] === 'user' && payload.exp > Date.now()) {
//       return generatePolicy(
//         payload.sub,
//         'Allow',
//         event.methodArn
//       ) as APIGatewayAuthorizerResult
//     } else {
//       return generatePolicy(
//         payload.sub,
//         'Deny',
//         event.methodArn
//       ) as APIGatewayAuthorizerResult
//     }
//   } catch (e) {
//     console.error(`Authorizer failed with: ${e}`)
//   }
//   return generatePolicy(
//     'User',
//     'Deny',
//     event.methodArn
//   ) as APIGatewayAuthorizerResult
// }
