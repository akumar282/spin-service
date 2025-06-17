import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getEnv } from '../../shared/utils'
import { apiResponse } from '../../apigateway/responses'

async function getItem(id: string, client: DynamoDBDocumentClient) {
  try {
    const command = new QueryCommand({
      TableName: getEnv('TABLE_NAME'),
      KeyConditionExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': id,
      },
    })
    const response = await client.send(command)
    if (response.Items) {
      return response.Items[0]
    } else {
      return apiResponse(
        {
          meta: response.$metadata,
          data: `No Item found with id: ${id}`,
        },
        200
      )
    }
  } catch (e) {
    return apiResponse('Error when getting item', 500)
  }
}
