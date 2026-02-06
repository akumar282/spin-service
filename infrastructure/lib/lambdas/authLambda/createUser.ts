import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { getEnv } from '../../shared/utils'

export async function CreateUser(
  sub: string,
  username: string,
  client: DynamoDBDocumentClient
): Promise<boolean> {
  try {
    const command = new PutCommand({
      TableName: getEnv('TABLE_NAME'),
      Item: {
        id: sub,
        user_name: username,
        email: username.includes('@') ? username : '',
        phone: !username.includes('@') ? username : '',
        notifyType: [],
        genres: [],
        labels: [],
        artists: [],
        albums: [],
        countryCode: {
          iso: 'US',
          dial: '+1',
        },
      },
    })
    const response = await client.send(command)
    return response.$metadata.httpStatusCode === 200
  } catch (e) {
    return false
  }
}
