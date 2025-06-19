import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv, getItem } from '../../shared/utils'
import { User } from '../../apigateway/types'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id
  if (id !== undefined) {
    switch (event.httpMethod) {
      case 'GET': {
        const item = await getItem(docClient, 'id = :id', {
          ':id': id,
        })
        if (item === null) {
          return apiResponse(`No user found with id: ${id}`, 404)
        }
        return apiResponse(
          {
            data: item,
          },
          200
        )
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
          const response = await docClient.send(command)
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
