import {
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandOutput,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { getEnv } from '../../shared/utils'

export async function updateAttributes(
  client: CognitoIdentityProviderClient,
  username: string,
  email: string,
  phone: string
) {
  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: getEnv('USER_POOL_ID'),
    Username: username,
    UserAttributes: [
      {
        Name: 'phone_number',
        Value: phone,
      },
      {
        Name: 'email',
        Value: email,
      },
    ],
  })
  const result: AdminUpdateUserAttributesCommandOutput = await client.send(
    command
  )

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error('Issue updating attributes')
  }
}
