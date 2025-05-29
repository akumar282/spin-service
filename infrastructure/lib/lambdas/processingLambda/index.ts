import { Context, SQSEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient } from '@aws-sdk/client-ses'
import { getEnv, requestWithBody } from '../../shared/utils'
import { SQSBody, OpenSearchUserResult, User } from '../../apigateway/types'
import {
  createQuery,
  deleteSQSMessage,
  determineNotificationMethods,
  sendEmail,
} from './functions'
import { SQSClient } from '@aws-sdk/client-sqs'

const client = new DynamoDBClient({
  retryMode: 'standard',
  maxAttempts: 3,
})

const ses = new SESClient({
  region: 'us-west-2',
})

const sqsClient = new SQSClient({})

const docClient = DynamoDBDocumentClient.from(client)

export async function handler(event: SQSEvent, context: Context) {
  const userTableName = getEnv('USERS_TABLE')
  const recordsTableName = getEnv('RECORDS_TABLE')
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
      const item = eventRecord.dynamodb.Keys

      let userQueryBody

      const ledgerTableResponse = await docClient.send(
        new PutCommand({
          TableName: ledgerTableName,
          Item: {
            postId: eventRecord.dynamodb.Keys.postId,
            status: 'STARTED',
            processed: false,
            to: [],
            ttl: Math.floor(Date.now() / 1000) + 86400,
          },
        })
      )

      const artistName = eventRecord.dynamodb.Keys.artist
      if (artistName) {
        userQueryBody = createQuery(artistName, eventRecord.dynamodb.Keys.genre)
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

        const emailUsers = await sendEmail(ses, email, item)
        // TODO: Add sms capabilities when twilio approves campaign. Contingent on client creation

        const deleteMessage = await deleteSQSMessage(
          eventRecord.receiptHandle,
          sqsClient
        )
      }
    }
  } catch (e) {}

  // intialize notified list
  // for each record
  // add to ledger status = unprocessed
  // get users by genre & artist for now
  // check noti prefs per user
  // send text & email
  // add user to notified list for that record
  // remove message from sqs if necessary
  // once all users done update ledger with processed users & status processed

  console.log(event)
  return apiResponse('Records processed successfully', 200)
}
