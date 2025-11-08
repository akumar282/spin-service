import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { getEnv, getItem } from '../../shared/utils'
import { User } from '../../apigateway/types'
import { ResponseBuilder } from '../../apigateway/response'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log(event)
  const id = event.pathParameters?.id
  const response = new ResponseBuilder('').addCors(event.headers.origin)
  if (id !== undefined) {
    switch (event.httpMethod) {
      case 'GET': {
        const item = await getItem(docClient, 'id = :id', {
          ':id': id,
        })
        if (item === null) {
          return response.addStatus(404).response
        }
        return response.addBody({ data: item }).addStatus(200).response
      }
      case 'PATCH': {
        if (event.body) {
          const body: Partial<User> = JSON.parse(event.body)
          const input: UpdateCommandInput = {
            ExpressionAttributeNames: {
              '#no': 'notifyType',
              '#ge': 'genres',
              '#la': 'labels',
              '#art': 'artists',
              '#al': 'albums',
              '#em': 'email',
              '#pho': 'phone',
            },
            ExpressionAttributeValues: {
              ':no': body.notifyType,
              ':ge': body.genres,
              ':la': body.labels,
              ':art': body.artists,
              ':al': body.albums,
              ':em': body.email,
              ':pho': body.phone,
            },
            Key: {
              id,
              user_name: body.user_name,
            },
            ReturnValues: 'ALL_NEW',
            TableName: getEnv('TABLE_NAME'),
            UpdateExpression:
              'SET #no = :no, #ge = :ge, #la = :la, #art = :art, #al = :al, #em = :em, #pho = :pho',
          }
          const command = new UpdateCommand(input)
          const data = await docClient.send(command)
          return response.addBody(data).addStatus(200).response
        } else {
          return response.addBody('').addStatus(500).response
        }
      }
      default: {
        return response.addBody('').addBody(400).response
      }
    }
  } else {
    return response.addBody('Missing path parameters').addStatus(500).response
  }
}
