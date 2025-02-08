import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../utils'
import { Records } from '../../apigateway/types'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const resource = event.path
  if (resource !== 'public' && resource !== 'public/{id}') {
    const info = {
      context,
      event,
      message: 'Invalid api path',
    }
    return apiResponse(info, 400)
  } else {
    switch (event.path) {
      case 'public': {
        if (event.httpMethod === 'POST') {
          if (event.body) {
            try {
              const body: Records = JSON.parse(event.body)
              const command = new PutCommand({
                TableName: getEnv('TABLE_NAME'),
                Item: {
                  body,
                },
              })
              const response = await docClient.send(command)
              return apiResponse(response, 200)
            } catch (e) {
              return apiResponse(
                {
                  error: e,
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
      default: {
        return apiResponse(event, 400)
      }
    }
  }
}
