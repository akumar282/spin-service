import { APIGatewayProxyEvent } from 'aws-lambda'
import twilio from 'twilio'
import { getEnv, getItem } from '../../shared/utils'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider'
import { ResponseBuilder } from '../../apigateway/response'
import { NotifyTypes, User } from '../../apigateway/types'
import { updateVals } from './functions'

const twilioToken = getEnv('TWILIO_TOKEN')

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
const cognitoClient = new CognitoIdentityProviderClient({
  maxAttempts: 3,
  region: 'us-west-2',
})

export async function handler(event: APIGatewayProxyEvent) {
  const optOutWords = [
    'cancel',
    'end',
    'optout',
    'quit',
    'revoke',
    'stop',
    'stopall',
    'unsubscribe',
  ]

  const optInWords = ['start', 'unstop', 'yes']

  const users: User[] = []
  const response = new ResponseBuilder('')
  const body = event.body
  const url = `https://${event.requestContext.domainName}${event.path}`

  if (body) {
    const params = new URLSearchParams(body)
    const parsedBody = Object.fromEntries(params)

    console.log(parsedBody)

    const requestSignature =
      event.headers['X-Twilio-Signature'] || event.headers['x-twilio-signature']

    if (!requestSignature) {
      return response.addStatus(403).addBody('Forbidden').build()
    }

    const valid = twilio.validateRequest(
      twilioToken,
      requestSignature,
      url,
      parsedBody
    )

    if (!valid) {
      return response.addStatus(403).addBody('Forbidden').build()
    }

    const from = parsedBody.From

    console.log(from)

    const command = new ListUsersCommand({
      AttributesToGet: undefined,
      Filter: `phone_number = "${from}"`,
      Limit: 10,
      UserPoolId: getEnv('USER_POOL_ID'),
    })

    let cognitoUsers: UserType[] | undefined

    try {
      const result = await cognitoClient.send(command)
      cognitoUsers = result.Users

      console.log(cognitoUsers)
    } catch (e) {
      console.log(e)
      return response.addStatus(500).build()
    }

    if (cognitoUsers) {
      for (const entry of cognitoUsers) {
        const id = entry.Username
        if (!id) {
          return response.addStatus(500).build()
        }
        try {
          console.log(id)
          console.log(entry)
          const item = await getItem(docClient, 'id = :id', {
            ':id': id,
          })
          users.push(item as User)
        } catch (e) {
          console.log(e)
          return response.addStatus(500).build()
        }
      }
    }
    console.log(users)

    const optOutType = parsedBody.OptOutType.toLowerCase()
    if (optOutWords.indexOf(optOutType) !== -1) {
      for (const user of users) {
        const notify = user.notifyType
        const index = notify.indexOf(NotifyTypes.TEXT)

        if (index === -1) {
          continue
        }

        notify.splice(index, 1)
        user.notifyType = notify

        try {
          const result = await docClient.send(
            new UpdateCommand(
              updateVals(user.notifyType, user.id, user.user_name, true)
            )
          )
          console.log(result)
        } catch (e) {
          console.log(e)
          return response.addStatus(500).build()
        }
      }
      return response.addStatus(200).build()
    } else if (optInWords.indexOf(optOutType) !== -1) {
      for (const user of users) {
        const notify = user.notifyType
        const index = notify.indexOf(NotifyTypes.TEXT)

        if (index === -1) {
          notify.push('TEXT' as NotifyTypes)
        } else {
          continue
        }

        user.notifyType = notify

        try {
          const result = await docClient.send(
            new UpdateCommand(
              updateVals(user.notifyType, user.id, user.user_name, false)
            )
          )
          console.log(result)
        } catch (e) {
          console.log(e)
          return response.addStatus(500).build()
        }
      }
    } else {
      return response.addStatus(200).build()
    }
  }
  return response.addStatus(200).build()
}
