import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand,
  QueryCommand,
  UpdateCommandInput,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'
import { Records } from '../../apigateway/types'
import { getItem } from './functions'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const resource = event.path
  if (resource !== '/raw' && resource !== '/raw/{id}') {
    const info = {
      context,
      event,
      message: 'Invalid api path',
    }
    return apiResponse(info, 400)
  } else {
    switch (event.path) {
      case '/raw': {
        if (event.httpMethod === 'POST') {
          if (event.body) {
            try {
              const body: Records = JSON.parse(event.body)
              const command = new PutCommand({
                TableName: getEnv('TABLE_NAME'),
                Item: body,
                ConditionExpression: 'attribute_not_exists(postId)',
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
      case '/raw/{id}': {
        const id = event.pathParameters?.id
        if (id !== undefined) {
          switch (event.httpMethod) {
            case 'GET': {
              const command = new QueryCommand({
                TableName: getEnv('TABLE_NAME'),
                KeyConditionExpression: 'postId = :postId',
                ExpressionAttributeValues: {
                  ':postId': id,
                },
              })
              const response = await docClient.send(command)
              if (response.Items) {
                return apiResponse(
                  {
                    meta: response.$metadata,
                    data: response.Items[0],
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
              const item = await getItem(id, docClient)
              if (item === null) {
                return apiResponse(`No Item found with id: ${id}`, 200)
              }
              const command = new DeleteCommand({
                TableName: getEnv('TABLE_NAME'),
                Key: {
                  id: item.postId,
                  created_time: item.created_time,
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
              if (event.body) {
                const body: Partial<Records> = JSON.parse(event.body)
                const item = await getItem(id, docClient)
                if (item === null) {
                  return apiResponse(`No Item found with id: ${id}`, 200)
                }
                const input: UpdateCommandInput = {
                  ExpressionAttributeNames: {
                    '#ti': 'title',
                    '#ar': 'artist',
                    '#ye': 'year',
                    '#me': 'media',
                  },
                  ExpressionAttributeValues: {
                    ':t': body.title,
                    ':ar': body.artist,
                    ':y': body.year,
                    ':m': body.media,
                  },
                  Key: {
                    postId: id,
                    created_time: item.created_time,
                  },
                  ReturnValues: 'ALL_NEW',
                  TableName: getEnv('TABLE_NAME'),
                  UpdateExpression:
                    'SET #ti = :t, #ar = :ar, #ye = :y, #me = :m',
                }
                const command = new UpdateCommand(input)
                const response = await client.send(command)
                return apiResponse(response, 200)
              } else {
                return apiResponse('Malformed request', 400)
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
