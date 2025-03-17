import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import {
  DeleteItemCommand,
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'
import { Records } from '../../apigateway/types'

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
              if (event.body) {
                const body: Partial<Records> = JSON.parse(event.body)
                const input: UpdateCommandInput = {
                  ExpressionAttributeNames: {
                    '#ti': 'title',
                    '#ar': 'artist',
                    '#ye': 'year',
                    '#me': 'media',
                  },
                  ExpressionAttributeValues: {
                    ':t': {
                      S: body.title,
                    },
                    ':ar': {
                      S: body.artist,
                    },
                    ':y': {
                      S: body.year,
                    },
                    ':m': {
                      S: body.media,
                    },
                  },
                  Key: {
                    id: {
                      S: body.id,
                    },
                  },
                  ReturnValues: 'ALL_NEW',
                  TableName: getEnv('TABLE_NAME'),
                  UpdateExpression:
                    'SET #ti = :t, #ar = :ar, #ye = :y, #me = :m',
                }
                const command = new UpdateItemCommand(input)
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
