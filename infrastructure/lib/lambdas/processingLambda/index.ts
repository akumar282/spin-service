import { Context, SQSEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient } from '@aws-sdk/client-ses'
import { getEnv, requestWithBody } from '../../shared/utils'
import {
  SQSBody,
  OpenSearchUserResult,
  User,
  Records,
} from '../../apigateway/types'
import {
  createQuery,
  deleteSQSMessage,
  determineNotificationMethods,
  sendEmail,
  updateLedgerItem,
} from './functions'
import { SQSClient } from '@aws-sdk/client-sqs'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const ses = new SESClient({
  region: 'us-west-2',
})
const sqsClient = new SQSClient({})
const client = new DynamoDBClient({
  retryMode: 'standard',
  maxAttempts: 3,
})
const docClient = DynamoDBDocumentClient.from(client)

/*
TODO: Update handler with deadlock logic, adding dropped users, and adding actual processed users.
 Currently all users are "processed". As well as Pinpoint for inapp notifications
*/
export async function handler(event: SQSEvent, context: Context) {
  const ledgerTableName = getEnv('LEDGER_TABLE')
  const endpoint = `https://${getEnv('OPEN_SEARCH_ENDPOINT')}/`

  const eventRecords: SQSBody[] = event.Records.map((record) => {
    const data = JSON.parse(record.body) as SQSBody
    data.receiptHandle = record.receiptHandle
    return data
  })

  const notifiedUsers = new Set<User>()
  const usersToProcess: User[] = []

  try {
    for (const eventRecord of eventRecords) {
      const item = unmarshall(eventRecord.dynamodb.NewImage) as Records

      let userQueryBody

      const ledgerTableResponse = await docClient.send(
        new PutCommand({
          TableName: ledgerTableName,
          Item: {
            postId: item.postId,
            status: 'STARTED',
            processed: false,
            to: [],
            ttl: Math.floor(Date.now() / 1000) + 86400,
          },
        })
      )

      const artistName = item.artist
      if (artistName) {
        userQueryBody = createQuery(artistName, item.genre)
        const data = await requestWithBody(
          'users/_search',
          endpoint,
          userQueryBody,
          'POST',
          `Basic ${Buffer.from(
            `${getEnv('USER')}:${getEnv('DASHPASS')}`
          ).toString('base64')}`
        )
        const users: OpenSearchUserResult = await data.json()
        users.hits.hits.forEach((x) => usersToProcess.push(x._source))
        const { email, phone, inapp } =
          determineNotificationMethods(usersToProcess)

        try {
          const emailUsers = await sendEmail(ses, email, item)
        } catch (e) {
          return apiResponse('Error emailing users', 500)
        }

        // TODO: Add sms capabilities when twilio approves campaign. Contingent on client creation

        try {
          const deleteMessage = await deleteSQSMessage(
            eventRecord.receiptHandle,
            sqsClient
          )
        } catch (e) {
          return apiResponse('Error deleting message', 500)
        }

        try {
          const updateLedger = await updateLedgerItem(
            docClient,
            usersToProcess,
            item.postId
          )
        } catch (e) {
          return apiResponse('Error updating ledger', 500)
        }
      }
    }
  } catch (e) {}
  return apiResponse('Records processed successfully', 200)
}
