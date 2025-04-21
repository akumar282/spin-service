import { APIGatewayProxyResult, Context, DynamoDBStreamEvent } from 'aws-lambda'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { requestWithBody } from './utils'

export async function handler(
  event: DynamoDBStreamEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const endpoint = getEnv('OPEN_SEARCH_ENDPOINT')

  try {
    const extractedDataRecords = event.Records.filter((x) =>
      x.eventSourceARN?.includes('records')
    ).map((x) =>
      unmarshall(x.dynamodb?.NewImage as Record<string, AttributeValue>)
    )

    const extractedDataUsers = event.Records.filter((x) =>
      x.eventSourceARN?.includes('users')
    ).map((x) =>
      unmarshall(x.dynamodb?.NewImage as Record<string, AttributeValue>)
    )

    if (extractedDataRecords.length > 0) {
      for (const records of extractedDataRecords) {
        const queryString = `records/_doc/${records.postId}`
        await requestWithBody(queryString, endpoint, records, 'POST')
      }
    }

    if (extractedDataUsers.length > 0) {
      for (const users of extractedDataUsers) {
        const queryString = `records/_doc/${users.postId}`
        await requestWithBody(queryString, endpoint, users, 'POST')
      }
    }
  } catch (e) {
    return apiResponse({ e, context }, 200)
  }
  return apiResponse('Export Ran Successfully', 200)
}
