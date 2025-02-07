import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../utils'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const resource = event.path
  if (resource !== 'raw' || resource !== 'raw/{id}') {
    const info = {
      context,
      event,
    }

    return apiResponse(info, 400)
  } else {
    switch (event.path) {
      case 'raw': {
        if (event.httpMethod === 'POST') {
        }
      }
      case 'raw/{id}': {
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
            case 'DELETE': {
              const command = new DeleteItemCommand({
                TableName: getEnv('TABLE_NAME'),
                Key: {
                  id: {
                    S: id,
                  },
                },
              })
              const response = await docClient.send(command)
              if (response.Attributes) {
                return apiResponse(
                  {
                    meta: response.$metadata,
                    data: response.Attributes,
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
            case 'PATCH': {
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
