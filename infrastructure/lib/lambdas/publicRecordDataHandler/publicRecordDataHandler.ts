import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv, getItem } from '../../shared/utils'
import { Records } from '../../apigateway/types'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const resource = event.path
  if (resource !== 'public' && resource !== 'public/{id}') {
    return apiResponse('Invalid api path', 400)
  } else {
    switch (event.path) {
      case 'public': {
        // Most likely unused
        if (event.httpMethod === 'POST') {
          if (event.body) {
            try {
              const body: Records = JSON.parse(event.body)
              const command = new PutCommand({
                TableName: getEnv('TABLE_NAME'),
                Item: body,
              })
              const response = await docClient.send(command)
              return apiResponse(response, 200)
            } catch (e) {
              return apiResponse(
                {
                  message: 'Internal Server Error',
                },
                300
              )
            }
          } else {
            return apiResponse('Malformed request', 400)
          }
        } else {
          return apiResponse('invalid method', 405)
        }
      }
      case 'public/{id}': {
        const id = event.pathParameters?.id
        if (id !== undefined) {
          switch (event.httpMethod) {
            case 'GET': {
              const item = await getItem(docClient, 'postId = :postId', {
                ':postId': id,
              })
              if (item === null) {
                return apiResponse(`No Item found with id: ${id}`, 200)
              }
              return apiResponse(
                {
                  data: item,
                },
                200
              )
            }
            default: {
              return apiResponse('invalid method', 405)
            }
          }
        } else {
          return apiResponse('id missing from Path Parameters', 400)
        }
      }
      default: {
        return apiResponse(event, 400)
      }
    }
  }
}
