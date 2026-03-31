import { SQSEvent } from 'aws-lambda'
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { getEnv, requestWithBody, updateLedgerItem } from '../../shared/utils'
import {
  SQSBody,
  OpenSearchUserResult,
  User,
  Records,
} from '../../apigateway/types'
import { createQuery, sendSQSMessage } from './functions'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { SQSClient } from '@aws-sdk/client-sqs'

const sqsClent = new SQSClient()
const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export async function handler(event: SQSEvent) {
  const authHeader = `Basic ${Buffer.from(
    `${getEnv('USER')}:${getEnv('DASHPASS')}`
  ).toString('base64')}`
  const ledgerTableName = getEnv('LEDGER_TABLE')
  const publishQueue = getEnv('DOWNSTREAM_QUEUE_URL')
  const endpoint = getEnv('OPENSEARCH_ENDPOINT')
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
            expires: Math.floor(Date.now() / 1000) + 86400,
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
        item.customTitle,
        item.genre
      )
      console.log(item.postId, JSON.stringify(userQueryBody))

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

        users.hits.hits.forEach((x) => usersToProcess.push(x._source))
      } catch (e) {
        console.error(`Opensearch Query Failure: ${e}`)
        await updateLedgerItem(docClient, [], item.postId, 'OS_QUERY_FAILURE')
        batchItemFailures.push({ itemIdentifier: eventRecord.messageId })
        continue
      }

      console.log(JSON.stringify(users.hits))

      const strippedUsers = usersToProcess.map(
        ({ id, email, phone, notifyType, countryCode }) =>
          ({
            id,
            email,
            phone,
            notifyType,
            countryCode,
          } as Partial<User>)
      )

      const partialItem = {
        id: item.id,
        postId: item.postId,
        artist: item.artist,
        media: item.media,
        album: item.album,
        content: item.content,
        link: item.link,
      } as Partial<Records>

      if (usersToProcess.length === 0) {
        await updateLedgerItem(docClient, [], item.postId, 'NO_RECIPIENTS')
        continue
      } else {
        try {
          const messageBody = {
            data: {
              item: partialItem,
              recipients: strippedUsers,
            },
          }

          await sendSQSMessage(messageBody, sqsClent, publishQueue)

          await updateLedgerItem(docClient, [], item.postId, 'PUBLISHED_USERS')
        } catch (e) {
          console.log(`SQS Publish Failure: ${e}`)
          batchItemFailures.push({ itemIdentifier: eventRecord.messageId })
          continue
        }
      }
    }
  }
  return { batchItemFailures }
}
