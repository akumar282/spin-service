import { DynamoDBRecord } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { requestWithBody } from './utils'

export async function transformAndPost(
  items: DynamoDBRecord[],
  endpoint: string,
  update: boolean
) {
  const extractedDataRecords = undynamo(items, 'records')

  const extractedDataUsers = undynamo(items, 'users')

  if (extractedDataRecords.length > 0) {
    await postItems(extractedDataRecords, endpoint, 'records', update)
  }

  if (extractedDataUsers.length > 0) {
    await postItems(extractedDataUsers, endpoint, 'users', update)
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
  index: string,
  update: boolean
) => {
  for (const item of items) {
    const queryString = update
      ? `${index}/_doc/${item.postId}`
      : `${index}/_update/${item.postId}`
    await requestWithBody(queryString, endpoint, item, 'POST')
  }
}
