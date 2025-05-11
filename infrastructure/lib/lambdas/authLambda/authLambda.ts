/* eslint-disable @typescript-eslint/naming-convention */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandOutput,
  SignUpCommand,
  SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider'
import { AuthRequest } from '../../apigateway/types'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'
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
        const cookies = [
          `accessToken=${AccessToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=3600`,
          `idToken=${IdToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=3600`,
          `refreshToken=${RefreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=2592000`,
        ]
        return apiResponse('Login Successful', 200, cookies)
      }
    } else if (body.type === 'new_user') {
      const command = new SignUpCommand({
        ClientId: clientId,
        Username: username,
        Password: password,
      })
      const result: SignUpCommandOutput = await cognitoClient.send(command)

      if (result.UserSub) {
        const register = await CreateUser(result.UserSub, username, docClient)

        if (!register) {
          return apiResponse('User Creation Failure', 500)
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
          const cookies = [
            `accessToken=${AccessToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=3600`,
            `idToken=${IdToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=3600`,
            `refreshToken=${RefreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=2592000`,
          ]
          return apiResponse('Login Successful', 200, cookies)
        }
      }
    }
  }
  return apiResponse('Invalid Body Provided', 400)
}
