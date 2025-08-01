import { DynamoDBRecord } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { getEnv, requestWithBody } from '../../shared/utils'

export async function transformAndPost(
  items: DynamoDBRecord[],
  endpoint: string,
  update: boolean
) {
  const extractedDataRecords = undynamo(items, 'records')

  const extractedDataUsers = undynamo(items, 'users')

  if (extractedDataRecords.length > 0) {
    await postItems(extractedDataRecords, endpoint, 'records', update, 'postId')
  }

  if (extractedDataUsers.length > 0) {
    await postItems(extractedDataUsers, endpoint, 'users', update, 'id')
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
  update: boolean,
  idAttribute: string
) => {
  for (const item of items) {
    const docItem = {
      doc: {
        ...item,
      },
    }

    const queryString = update
      ? `${index}/_update/${item[idAttribute]}`
      : `${index}/_doc/${item[idAttribute]}`
    console.info('Sending: ', item)
    const result = await requestWithBody(
      queryString,
      endpoint,
      update ? docItem : item,
      'POST',
      `Basic ${Buffer.from(`${getEnv('USER')}:${getEnv('DASHPASS')}`).toString(
        'base64'
      )}`
    )
    const result2 = await result.json()
    console.log(result2)
  }
}
