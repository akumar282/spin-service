import { SQSEvent } from 'aws-lambda'
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient } from '@aws-sdk/client-ses'
import { getEnv, getSsmParam, requestWithBody } from '../../shared/utils'
import {
  SQSBody,
  OpenSearchUserResult,
  User,
  Records,
} from '../../apigateway/types'
import {
  createQuery,
  determineNotificationMethods,
  sendEmail,
  updateLedgerItem,
} from './functions'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { SSMClient } from '@aws-sdk/client-ssm'
import twilio from 'twilio'

const ssmClient = new SSMClient()
const ses = new SESClient({})
const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const twilioSid = getEnv('TWILIO_SID')
const twilioApiKeySid = getEnv('TWILIO_API_SID')
const twilioApiSecret = getEnv('TWILIO_API_KEY')
const messagingSid = getEnv('MESSAGE_SID')

const twilioClient = twilio(twilioApiKeySid, twilioApiSecret, {
  accountSid: twilioSid,
  maxRetries: 2,
})

/*
  TODO: Pinpoint for push notifications
*/

export async function handler(event: SQSEvent) {
  const authHeader = `Basic ${Buffer.from(
    `${getEnv('USER')}:${getEnv('DASHPASS')}`
  ).toString('base64')}`
  const ledgerTableName = getEnv('LEDGER_TABLE')
  const ssmParam = await getSsmParam(ssmClient, '/os/endpoint')
  const endpoint = ssmParam ? ssmParam.Value : null
  const batchItemFailures = []

  if (!endpoint) {
    console.error('Endpoint is not defined')
    return {
      batchItemFailures: event.Records.map((record) => ({
        itemIdentifier: record.messageId,
      })),
    }
  }

  const eventRecords: SQSBody[] = event.Records.map((record) => {
    const data = JSON.parse(record.body) as SQSBody
    data.receiptHandle = record.receiptHandle
    data.messageId = record.messageId
    return data
  })

  for (const eventRecord of eventRecords) {
    const usersToProcess: User[] = []
    const item = unmarshall(eventRecord.dynamodb.NewImage) as Records
    let userQueryBody

    console.log(`Processing: ${item.postId}`)

    try {
      await docClient.send(
        new PutCommand({
          TableName: ledgerTableName,
          Item: {
            postId: item.postId,
            status: 'STARTED',
            processed: false,
            to: [],
            ttl: Math.floor(Date.now() / 1000) + 86400,
          },
          ConditionExpression: 'attribute_not_exists(postId)',
        })
      )
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException) {
        continue
      }
      console.error(`Dynamo Error: ${e}`)
      batchItemFailures.push({ itemIdentifier: eventRecord.messageId })
      continue
    }

    const artistName = item.artist

    if (artistName) {
      userQueryBody = createQuery(
        artistName,
        item.album,
        item.media,
        item.genre
      )
      console.log(JSON.stringify(userQueryBody))

      let users: OpenSearchUserResult

      try {
        const data = await requestWithBody(
          'users/_search',
          endpoint,
          userQueryBody,
          'POST',
          authHeader
        )
        users = await data.json()
      } catch (e) {
        console.log(`Opensearch Query Failure: ${e}`)
        batchItemFailures.push({ itemIdentifier: eventRecord.messageId })
        continue
      }

      users.hits.hits.forEach((x) => usersToProcess.push(x._source))

      if (usersToProcess.length === 0) {
        await updateLedgerItem(docClient, [], item.postId, 'NO_RECIPIENTS')
        continue
      }

      const { email, phone, inapp } =
        determineNotificationMethods(usersToProcess)

      try {
        await sendEmail(ses, email, item)
        console.log(`Emailed for: ${item.postId}`)
      } catch (e) {
        await updateLedgerItem(docClient, [], item.postId, 'FAILED_EMAIL')
        batchItemFailures.push({ itemIdentifier: eventRecord.messageId })
        console.error(
          'Error sending emails for record ',
          item.postId,
          'Failed with error ',
          e
        )
        continue
      }

      for (const user of phone) {
        const number = `${user.countryCode.dial}${user.phone}`
        try {
          const message = await twilioClient.messages.create({
            messagingServiceSid: messagingSid,
            to: number,
            body: `SpinMyRecords: The record, ${item.album} by ${item.artist} is now available. Get it now: https://www.spinmyrecords.com/release/${item.postId} . Reply STOP to stop.`,
          })
        } catch (e) {
          console.error(
            'Error sending text for record ',
            item.postId,
            'Failed with error ',
            e
          )
          continue
        }
      }

      console.log(`Texted for: ${item.postId}`)

      try {
        const ids = usersToProcess.map((x) => x.id)
        await updateLedgerItem(docClient, ids, item.postId)
        console.log(`Finished for: ${item.postId}`)
      } catch (e) {
        console.error(
          'Error updating ledger for ',
          item.postId,
          'Failed with error ',
          e
        )
        batchItemFailures.push({ itemIdentifier: eventRecord.messageId })
      }
    } else {
      await updateLedgerItem(docClient, [], item.postId, 'MISSING_INFO')
    }
  }
  return { batchItemFailures }
}
