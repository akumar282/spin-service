import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { getEnv } from '../../shared/utils'
import { Upcoming } from '../../apigateway/types'
import { ResponseBuilder } from '../../apigateway/response'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const response = new ResponseBuilder('').addCors(event.headers.origin)
  if (event.httpMethod === 'POST') {
    if (event.body) {
      try {
        const body: Upcoming = JSON.parse(event.body)
        const command = new PutCommand({
          TableName: getEnv('TABLE_NAME'),
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
  if (event.httpMethod === 'GET') {
    try {
      const nextToken = event.queryStringParameters?.cursor
      const count = event.queryStringParameters?.count

      const input = {
        TableName: getEnv('TABLE_NAME'),
        IndexName: 'id',
      }

      if (nextToken) {
        const cursor = JSON.parse(
          Buffer.from(nextToken, 'base64').toString('utf8')
        )
        Object.assign(input, { ExclusiveStartKey: cursor })
      }

      const command = new QueryCommand(input)

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
  } else {
    return response.addBody('Unsupported Method').addStatus(405).build()
  }
}
