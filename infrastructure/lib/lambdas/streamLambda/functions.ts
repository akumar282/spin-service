import { DynamoDBRecord } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { requestWithBody } from './utils'

export async function transformAndPost(
  items: DynamoDBRecord[],
  endpoint: string
) {
  const extractedDataRecords = undynamo(items, 'records')

  const extractedDataUsers = undynamo(items, 'users')

  if (extractedDataRecords.length > 0) {
    await postItems(extractedDataRecords, endpoint, 'records')
  }

  if (extractedDataUsers.length > 0) {
    await postItems(extractedDataUsers, endpoint, 'users')
  }
}

const undynamo = (items: DynamoDBRecord[], type: string) => {
  return items
    .filter((x) => x.eventSourceARN?.includes(type))
    .map((x) =>
      unmarshall(x.dynamodb?.NewImage as Record<string, AttributeValue>)
    )
}

const postItems = async (
  items: Record<string, any>[],
  endpoint: string,
  index: string
) => {
  for (const item of items) {
    const queryString = `${index}/_doc/${item.postId}`
    await requestWithBody(queryString, endpoint, item, 'POST')
  }
}
