import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv, getItem } from '../../shared/utils'
import { Records } from '../../apigateway/types'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const resource = event.path
  switch (event.path) {
    case '/public': {
      switch (event.httpMethod) {
        case 'GET': {
          try {
            const nextToken = event.queryStringParameters?.cursor
            const count = event.queryStringParameters?.count

            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
            const yesterdayString = `DATE#${(
              yesterday.getMonth() + 1
            ).toString()}-${yesterday.getDate().toString()}`
            const cutoff = yesterdayString
            console.log(yesterdayString)

            const input = {
              TableName: getEnv('TABLE_NAME'),
              IndexName: 'dateGroup',
              Limit: !isNaN(Number(count)) ? Number(count) : 20,
              KeyConditionExpression: 'dateGroup = :dateGroup',
              ExpressionAttributeValues: {
                ':dateGroup': cutoff,
              },
            }

            if (nextToken) {
              const cursor = JSON.parse(
                Buffer.from(nextToken, 'base64').toString('utf8')
              )
              Object.assign(input, { ExclusiveStartKey: cursor })
            }

            const command = new QueryCommand(input)

            const response = await client.send(command)
            console.log(response)

            return apiResponse(
              {
                items: response.Items,
                cursor: response.LastEvaluatedKey
                  ? Buffer.from(
                      JSON.stringify(response.LastEvaluatedKey)
                    ).toString('base64')
                  : null,
              },
              200,
              undefined,
              true
            )
          } catch (e) {
            console.log(e)
            return apiResponse(
              {
                message: 'Internal Server Error',
              },
              300,
              undefined,
              true
            )
          }
        }
        case 'POST': {
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
        }
      }
      return apiResponse('Malformed request', 400)
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
