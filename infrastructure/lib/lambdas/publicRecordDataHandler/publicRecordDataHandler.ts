import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import { getEnv, getItem } from '../../shared/utils'
import { Records } from '../../apigateway/types'
import { ResponseBuilder } from '../../apigateway/response'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const response = new ResponseBuilder('').addCors(event.headers.origin)
  switch (event.resource) {
    case '/public': {
      switch (event.httpMethod) {
        case 'GET': {
          try {
            const nextToken = event.queryStringParameters?.cursor
            const count = event.queryStringParameters?.count

            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
            const rightNow = new Date().toISOString()
            const monthString = `DATE#${(yesterday.getMonth() + 1).toString()}`
            const cutoff = monthString
            console.log(monthString)

            const input = {
              TableName: getEnv('TABLE_NAME'),
              IndexName: 'dateGroup',
              Limit: !isNaN(Number(count)) ? Number(count) : 20,
              KeyConditionExpression:
                'dateGroup = :dateGroup AND created_time BETWEEN :yesterday AND :today',
              FilterExpression: '#rt <> :releaseType',
              ExpressionAttributeNames: {
                '#rt': 'releaseType',
              },
              ScanIndexForward: false,
              ExpressionAttributeValues: {
                ':releaseType': 'RELEASE NEWS',
                ':dateGroup': cutoff,
                ':yesterday': yesterday.toISOString(),
                ':today': rightNow,
              },
            }

            if (nextToken) {
              const cursor = JSON.parse(
                Buffer.from(nextToken, 'base64').toString('utf8')
              )
              Object.assign(input, { ExclusiveStartKey: cursor })
            }

            const command = new QueryCommand(input)

            const item = await client.send(command)

            return response
              .addBody({
                items: item.Items,
                cursor: item.LastEvaluatedKey
                  ? Buffer.from(JSON.stringify(item.LastEvaluatedKey)).toString(
                      'base64'
                    )
                  : null,
              })
              .addStatus(200)
              .build()
          } catch (e) {
            console.log(e)
            return response
              .addBody({
                message: 'Internal Server Error',
              })
              .addStatus(300)
              .build()
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
              const item = await docClient.send(command)
              return response.addBody(item).addStatus(200).build()
            } catch (e) {
              return response
                .addBody({
                  message: 'Internal Server Error',
                })
                .addStatus(500)
                .build()
            }
          } else {
            return response.addBody('Bad Request').addStatus(400).build()
          }
        }
      }
      return response.addBody('Bad Request').addStatus(400).build()
    }
    case '/public/{id}': {
      const id = event.pathParameters?.id
      if (id !== undefined) {
        switch (event.httpMethod) {
          case 'GET': {
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
            return response.addBody(item).addStatus(200).build()
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
    case '/public/upcoming': {
      if (event.httpMethod === 'GET') {
        try {
          const nextToken = event.queryStringParameters?.cursor
          const count = event.queryStringParameters?.count

          const input = {
            TableName: getEnv('UPCOMING_TABLE'),
            Limit: !isNaN(Number(count)) ? Number(count) : 20,
          }

          if (nextToken) {
            const cursor = JSON.parse(
              Buffer.from(nextToken, 'base64').toString('utf8')
            )
            Object.assign(input, { ExclusiveStartKey: cursor })
          }

          const command = new ScanCommand(input)

          const query = await client.send(command)
          console.log(response)
          return response
            .addBody({
              items: query.Items,
              cursor: query.LastEvaluatedKey
                ? Buffer.from(JSON.stringify(query.LastEvaluatedKey)).toString(
                    'base64'
                  )
                : null,
            })
            .addStatus(200)
            .build()
        } catch (e) {
          console.log(e)
          return response
            .addBody({
              message: 'Internal Server Error',
            })
            .addStatus(500)
            .build()
        }
      }
      return response.addBody('Invalid Method').addStatus(400).build()
    }
    default: {
      return response.addBody('Default').addStatus(400).build()
    }
  }
}
