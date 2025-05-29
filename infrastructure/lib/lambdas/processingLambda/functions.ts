import { NotifyTypes, Records, User } from '../../apigateway/types'
import {
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
  SESClient,
} from '@aws-sdk/client-ses'
import {
  DeleteMessageCommand,
  DeleteMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs'
import { getEnv } from '../../shared/utils'
import {
  DynamoDBDocumentClient,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb'

export function createQuery(artist: string, genres: string[]) {
  const shouldList = []
  shouldList.push({ match: { artists: artist } })
  if (genres && genres.length > 0) {
    for (const genre of genres) {
      shouldList.push({ match: { genres: genre } })
    }
  }
  return {
    query: {
      bool: {
        must: [
          {
            bool: {
              should: shouldList,
              minimum_should_match: 1,
            },
          },
        ],
      },
    },
  }
}

export async function sendEmail(
  client: SESClient,
  destination: User[],
  item: Records
): Promise<SendEmailCommandOutput> {
  const input: SendEmailCommandInput = {
    Destination: {
      BccAddresses: destination.map((user) => user.email),
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `The record, ${item.title} by ${item.artist} is now available. 
                 Get it now:  <a class="ulink" href="${item.link}" target="_blank">
                 Record Store Link</a>.`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `You liked this record, we got back to that for the record: ${item.title} is in stock.`,
      },
    },
    Source: 'notifications@spinmyrecords.com',
  }
  const command = new SendEmailCommand(input)
  return await client.send(command)
}

export function determineNotificationMethods(users: User[]) {
  const email: User[] = []
  const phone: User[] = []
  const inapp: User[] = []

  for (const user of users) {
    if (user.notifyType.includes(NotifyTypes.EMAIL) && user.email) {
      email.push(user)
    }
    if (user.notifyType.includes(NotifyTypes.SMS) && user.phone) {
      phone.push(user)
    }
    if (user.notifyType.includes(NotifyTypes.INAPP)) {
      inapp.push(user)
    }
  }
  return {
    email,
    phone,
    inapp,
  }
}

export async function deleteSQSMessage(
  ReceiptHandle: string,
  client: SQSClient
): Promise<DeleteMessageCommandOutput> {
  const command = new DeleteMessageCommand({
    QueueUrl: getEnv('SQS_URL'),
    ReceiptHandle,
  })
  return await client.send(command)
}

export async function updateLedgerItem(
  client: DynamoDBDocumentClient,
  to: User[],
  id: string
) {
  const input: UpdateCommandInput = {
    ExpressionAttributeNames: {
      '#st': 'status',
      '#pr': 'processed',
      '#to': 'to',
    },
    ExpressionAttributeValues: {
      ':st': {
        S: 'COMPLETED',
      },
      ':pr': {
        BOOL: true,
      },
      ':to': {
        L: to,
      },
    },
    Key: {
      id: {
        S: id,
      },
    },
    ReturnValues: 'ALL_NEW',
    TableName: getEnv('TABLE_NAME'),
    UpdateExpression: 'SET #st = :st, #pr = :pr, #to = :to',
  }
  const command = new UpdateItemCommand(input)
  return await client.send(command)
}
