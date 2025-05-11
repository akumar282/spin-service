import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { getEnv } from '../../shared/utils'

export async function CreateUser(
  sub: string,
  username: string,
  client: DynamoDBDocumentClient
): Promise<boolean> {
  const command = new PutCommand({
    TableName: getEnv('TABLE_NAME'),
    Item: {
      id: sub,
      email: username.includes('@') ? username : '',
      phone: !username.includes('@') ? username : '',
      notifyType: [],
      genres: [],
      labels: [],
      artists: [],
      albums: [],
    },
  })
  const response = await client.send(command)
  if (response.$metadata.httpStatusCode === 200) {
    return true
  }
  return false
}
