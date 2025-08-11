import { Records, SQSBody } from '../../../infrastructure/lib/apigateway/types'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { handler } from '../../../infrastructure/lib/lambdas/processingLambda'
import { Context } from 'aws-lambda'
import process from 'node:process'
import 'aws-sdk-client-mock-jest'
import { sqsEvent, userTest, wrappedReturn } from '../../testData/constants'

describe('Test for procesing handler', () => {
  test('Handler mock test', async () => {
    process.env.LEDGER_TABLE = 'ledgerTable'

    process.env.SQS_URL =
      'https://sqs.us-west-2.amazonaws.com/739292628626/SpinServiceStack-prod-processingqueueA47DA09A-WuqWsdAjytVW'

    const result = await handler(sqsEvent)

    expect(result).toEqual(200)
  })

  test('Deserialize logic test', () => {
    const eventRecords: SQSBody[] = sqsEvent.Records.map((record) => {
      const data = JSON.parse(record.body) as SQSBody
      data.receiptHandle = record.receiptHandle
      return data
    })

    for (const eventRecord of eventRecords) {
      const item = eventRecord.dynamodb.NewImage
      const unmarshalled = unmarshall(item) as Records
      console.info(unmarshalled)
    }
  })
})
