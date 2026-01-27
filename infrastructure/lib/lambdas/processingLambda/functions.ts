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
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

export function createQuery(
  artist: string,
  album: string,
  media: string,
  genres: string[]
) {
  const shouldList = []
  shouldList.push({
    bool: {
      must: [
        { match: { 'albums.album': album } },
        { term: { 'albums.type.keyword': media } },
      ],
    },
  })
  shouldList.push({
    term: { 'artists.keyword': { value: artist, case_insensitive: true } },
  })
  if (genres && genres.length > 0) {
    for (const genre of genres) {
      shouldList.push({ match: { genres: genre } })
    }
  }
  return {
    query: {
      bool: {
        should: shouldList,
        minimum_should_match: 1,
      },
    },
  }
}

export async function sendEmail(
  client: SESClient,
  destination: User[],
  item: Records
): Promise<SendEmailCommandOutput> {
  console.log(destination)
  const link = item.content ? item.content : item.link
  const input: SendEmailCommandInput = {
    Destination: {
      ToAddresses: ['actuallychowmein@gmail.com'],
      BccAddresses: destination.map((user) => user.email),
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `The record, ${item.album} by ${item.artist} is now available. 
                 Get it now:  <a class="ulink" href="${link}" target="_blank">
                 Record Store Link</a>.`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `You liked this record: ${item.title} is in stock.`,
      },
    },
    Source: '"spin-service" <notifications@spinmyrecords.com>',
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
    if (user.notifyType.includes(NotifyTypes.PUSH)) {
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
  to: string[],
  id: string,
  status?: string
) {
  const input: UpdateCommandInput = {
    ExpressionAttributeNames: {
      '#st': 'status',
      '#pr': 'processed',
      '#to': 'to',
    },
    ExpressionAttributeValues: {
      ':st': status ?? 'COMPLETED',
      ':pr': true,
      ':to': to,
    },
    Key: {
      postId: id,
    },
    ReturnValues: 'ALL_NEW',
    TableName: getEnv('LEDGER_TABLE'),
    UpdateExpression: 'SET #st = :st, #pr = :pr, #to = :to',
  }
  const command = new UpdateCommand(input)
  return await client.send(command)
}
