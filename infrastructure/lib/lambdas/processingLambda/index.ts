import { Context, DynamoDBRecord, SQSEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'
import { type AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient } from '@aws-sdk/client-ses'
import { getEnv, requestWithBody } from '../../shared/utils'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { SQSBody } from '../../apigateway/types'
import { createQuery } from './functions'

const client = new DynamoDBClient({
  retryMode: 'standard',
  maxAttempts: 3,
})

const ses = new SESClient({
  region: 'us-west-2',
})

const docClient = DynamoDBDocumentClient.from(client)

export async function handler(event: SQSEvent, context: Context) {
  const userTableName = getEnv('USERS_TABLE')
  const recordsTableName = getEnv('RECORDS_TABLE')
  const ledgerTableName = getEnv('LEDGER_TABLE')
  const endpoint = `https://${getEnv('OPEN_SEARCH_ENDPOINT')}/`

  const eventRecords: SQSBody[] = event.Records.map((record) => JSON.parse(record.body) as SQSBody)
  const notifiedUsers = []
  const usersToProcess = []

  try {
    for (const event of eventRecords) {
      let userQueryBody
      const ledgerTableResponse = await docClient.send(new PutCommand({
        TableName: ledgerTableName,
        Item: {
          postId: event.dynamodb.Keys.postId,
          status: 'STARTED',
          processed: false,
          to: [],
          ttl: Math.floor(Date.now()/1000) + 86400
        }})
      )

      const artistName = event.dynamodb.Keys.artist
      if(artistName) {
        userQueryBody = createQuery(artistName, event.dynamodb.Keys.genre)
        const data = await requestWithBody(
          'users/_search',
          endpoint,
          userQueryBody,
          'POST',
          `Basic ${Buffer.from(`${getEnv('USER')}:${getEnv('DASHPASS')}`).toString(
            'base64'
          )}`
        )
      }
    }
  } catch (e) {

  }

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
