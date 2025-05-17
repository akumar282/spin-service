import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id
  if (id !== undefined) {
    switch (event.httpMethod) {
      case 'GET': {
        const command = new GetCommand({
          TableName: getEnv('TABLE_NAME'),
          Key: {
            id,
          },
        })
        const response = await docClient.send(command)
        if (response.Item) {
          return apiResponse(
            {
              meta: response.$metadata,
              data: response.Item,
            },
            200
          )
        } else {
          return apiResponse(
            {
              meta: response.$metadata,
              data: `No Item found with id: ${id}`,
            },
            200
          )
        }
      }
      default: {
        return apiResponse('invalid method', 405)
      }
    }
  } else {
    return apiResponse('id missing from Path Parameters', 400)
  }
}
