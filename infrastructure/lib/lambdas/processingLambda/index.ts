import { Context, SQSEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
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

const ssmClient = new SSMClient()
const ses = new SESClient({})
const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

/*
TODO: Update handler with deadlock logic, adding dropped users, and adding actual processed users.
 Currently all users are "processed". As well as Pinpoint for inapp notifications
*/
export async function handler(event: SQSEvent, context: Context) {
  const ledgerTableName = getEnv('LEDGER_TABLE')
  const ssmParam = await getSsmParam(ssmClient, '/os/endpoint')
  const endpoint = ssmParam ? ssmParam.Value : null

  if (!endpoint) {
    return apiResponse('Endpoint is not defined', 500)
  }

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
      console.log(artistName)
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
          console.error(
            'Error sending emails for record ',
            item.postId,
            'Failed with error ',
            e
          )
          return 500
        }

        // TODO: Add sms capabilities when twilio approves campaign. Contingent on client creation

        try {
          const updateLedger = await updateLedgerItem(
            docClient,
            usersToProcess,
            item.postId
          )
        } catch (e) {
          console.error(
            'Error updating ledger for ',
            item.postId,
            'Failed with error ',
            e
          )
          return 500
        }
      }
    }
  } catch (e) {
    console.error('Records processing failed with ', e)
    return 500
  }
  return 200
}
