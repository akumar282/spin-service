import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand,
  QueryCommand,
  UpdateCommandInput,
  DeleteCommand,
  PutCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import { getEnv, getItem } from '../../shared/utils'
import { Records, Upcoming } from '../../apigateway/types'
import { ResponseBuilder } from '../../apigateway/response'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const response = new ResponseBuilder('')
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
            const data: PutCommandOutput = await docClient.send(command)
            return response.addBody(data).addStatus(200).build()
          } catch (e) {
            return response
              .addBody({
                error: e,
                message: 'Internal Server Error',
              })
              .addStatus(300)
              .build()
          }
        } else {
          return response.addBody('Bad Request').addStatus(400).build()
        }
      } else {
        return response.addBody('Invalid Method').addStatus(400).build()
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
            const data = await docClient.send(command)
            if (data.Items) {
              return response
                .addBody({
                  meta: data.$metadata,
                  data: data.Items[0],
                })
                .addStatus(200)
                .build()
            } else {
              return response
                .addBody({
                  meta: data.$metadata,
                  data: `No Item found with id: ${id}`,
                })
                .addStatus(404)
                .build()
            }
          }
          case 'DELETE': {
            const item = await getItem(docClient, 'postId = :postId', {
              ':postId': id,
            })
            if (item === null) {
              return response
                .addBody({
                  data: `No Item found with id: ${id}`,
                })
                .addStatus(404)
                .build()
            }
            const command = new DeleteCommand({
              TableName: getEnv('TABLE_NAME'),
              Key: {
                id: item.postId,
                created_time: item.created_time,
              },
            })
            const remove = await docClient.send(command)
            if (remove.Attributes) {
              return response
                .addBody({
                  meta: remove.$metadata,
                  data: remove.Attributes,
                })
                .addStatus(200)
                .build()
            } else {
              return response
                .addBody({
                  data: `No Item found with id: ${id}`,
                })
                .addStatus(404)
                .build()
            }
          }
          case 'PATCH': {
            if (event.body) {
              const body: Partial<Records> = JSON.parse(event.body)
              // Getting first as I created a composite key like a moron
              const item = await getItem(docClient, 'postId = :postId', {
                ':postId': id,
              })
              if (item === null) {
                return response
                  .addBody({
                    data: `No Item found with id: ${id}`,
                  })
                  .addStatus(404)
                  .build()
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
                UpdateExpression: 'SET #ti = :t, #ar = :ar, #ye = :y, #me = :m',
              }
              const command = new UpdateCommand(input)
              const update = await client.send(command)
              return response.addBody(update).addStatus(200).build()
            } else {
              return response.addBody('Bad request').addStatus(400).build()
            }
          }
          default: {
            return response.addBody('Invalid Method').addStatus(400).build()
          }
        }
      } else {
        return response
          .addBody('Missing path parameters')
          .addStatus(403)
          .build()
      }
    }
    case '/raw/upcoming': {
      if (event.httpMethod === 'POST') {
        if (event.body) {
          try {
            const body: Upcoming = JSON.parse(event.body)
            const command = new PutCommand({
              TableName: getEnv('UPCOMING_TABLE'),
              Item: body,
            })
            const placeItem: PutCommandOutput = await docClient.send(command)
            return response.addBody(placeItem).addStatus(200).build()
          } catch (e) {
            return response.addBody(e).addStatus(500).build()
          }
        } else {
          return response.addBody('Invalid Body').addStatus(400).build()
        }
      }
      return response.addBody('Invalid Method').addStatus(400).build()
    }
    default: {
      return response.addBody('Default').addStatus(400).build()
    }
  }
}
