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
import { updateAttributes } from './attributes'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
const cognitoClient = new CognitoIdentityProviderClient({
  maxAttempts: 3,
  region: 'us-west-2',
})

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
          return response.addStatus(404).build()
        }
        return response.addBody({ data: item }).addStatus(200).build()
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
          const attr = await updateAttributes(
            cognitoClient,
            id,
            body.email || '',
            body.phone || ''
          )
          const command = new UpdateCommand(input)
          const data = await docClient.send(command)
          return response.addBody(data).addStatus(200).build()
        } else {
          return response.addBody('Update Failed').addStatus(500).build()
        }
      }
      default: {
        return response.addBody('').addBody(400).build()
      }
    }
  } else {
    return response.addBody('Missing path parameters').addStatus(500).build()
  }
}
