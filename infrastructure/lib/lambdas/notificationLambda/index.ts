import { SQSEvent } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SESClient } from '@aws-sdk/client-ses'
import { getEnv, updateLedgerItem } from '../../shared/utils'
import { NotificationQueueBody } from '../../apigateway/types'
import { determineNotificationMethods, sendEmail } from './functions'
import twilio from 'twilio'

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
  const batchItemFailures = []

  for (const record of event.Records) {
    let notificationEvent: NotificationQueueBody
    try {
      const parsed = JSON.parse(record.body) as NotificationQueueBody
      parsed.messageId = record.messageId
      notificationEvent = parsed
    } catch (e) {
      console.error(
        `Malformed notification payload for messageId ${record.messageId}`,
        e
      )
      continue
    }

    const item = notificationEvent?.data?.item
    const usersToProcess = notificationEvent?.data?.recipients ?? []

    if (!item?.postId) {
      console.error(
        `Missing item.postId in notification payload for messageId ${record.messageId}`
      )
      continue
    }

    await updateLedgerItem(docClient, [], item.postId, 'BEGIN_NOTIFY')

    console.log(`Notifying for: ${item.postId}`)

    const { email, phone, inapp } = determineNotificationMethods(usersToProcess)

    try {
      await sendEmail(ses, email, item)
      console.log(`Emailed for: ${item.postId}`)
    } catch (e) {
      await updateLedgerItem(docClient, [], item.postId, 'FAILED_EMAIL')
      batchItemFailures.push({ itemIdentifier: notificationEvent.messageId })
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
      await updateLedgerItem(docClient, ids, item.postId, 'ALL_SENT')
      console.log(`Finished for: ${item.postId}`)
    } catch (e) {
      console.error(
        'Error updating ledger for ',
        item.postId,
        'Failed with error ',
        e
      )
      batchItemFailures.push({ itemIdentifier: notificationEvent.messageId })
    }
  }
  return { batchItemFailures }
}
