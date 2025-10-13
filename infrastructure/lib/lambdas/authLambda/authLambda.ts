/* eslint-disable @typescript-eslint/naming-convention */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import {
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandOutput,
  SignUpCommand,
  SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider'
import { AuthRequest } from '../../apigateway/types'
import { apiResponse } from '../../apigateway/responses'
import { cookies, getEnv } from '../../shared/utils'
import { CreateUser } from './createUser'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
const cognitoClient = new CognitoIdentityProviderClient({
  maxAttempts: 3,
  region: 'us-west-2',
})

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (event.body) {
    const body: AuthRequest = JSON.parse(event.body)

    const { username, password } = body.credentials

    const clientId =
      body.platform === 'mobile'
        ? getEnv('MOBILE_CLIENT_ID')
        : getEnv('WEB_CLIENT_ID')

    if (body.type === 'login') {
      const result: InitiateAuthCommandOutput = await cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
          },
          ClientId: clientId,
        })
      )

      if (result.AuthenticationResult) {
        const { AccessToken, IdToken, RefreshToken } =
          result.AuthenticationResult
        return apiResponse(
          'Login Successful',
          200,
          cookies(AccessToken, IdToken, RefreshToken),
          true,
          event.headers.origin
        )
      }
    } else if (body.type === 'new_user') {
      const command = new SignUpCommand({
        ClientId: clientId,
        Username: username,
        Password: password,
        UserAttributes: [
          {
            Name: 'custom:role',
            Value: 'user',
          },
          {
            Name: 'custom:version',
            Value: '1',
          },
        ],
      })
      const result: SignUpCommandOutput = await cognitoClient.send(command)

      if (result.UserSub) {
        await cognitoClient.send(
          new AdminConfirmSignUpCommand({
            UserPoolId: getEnv('USER_POOL_ID'),
            Username: username,
          })
        )

        const register = await CreateUser(result.UserSub, username, docClient)

        if (!register) {
          return apiResponse(
            'User Creation Failure',
            500,
            undefined,
            true,
            event.headers.origin
          )
        }

        const loginCommand = await cognitoClient.send(
          new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
              USERNAME: username,
              PASSWORD: password,
            },
            ClientId: clientId,
          })
        )

        if (loginCommand.AuthenticationResult) {
          const { AccessToken, IdToken, RefreshToken } =
            loginCommand.AuthenticationResult
          return apiResponse(
            'Login Successful',
            200,
            cookies(AccessToken, IdToken, RefreshToken),
            true,
            event.headers.origin
          )
        }
      }
    }
  }
  return apiResponse('Invalid Body Provided', 400, undefined, true)
}
