import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getEnv } from '../../shared/utils'
import {
  Cursor,
  DynamoCursorKey,
  RecordsReturned,
  SchemalessRecords,
} from './types'

function sortByCreatedTimeDesc(
  items: SchemalessRecords[]
): SchemalessRecords[] {
  return [...items].sort((a, b) => {
    const aTime = a.created_time ? Date.parse(a.created_time) : 0
    const bTime = b.created_time ? Date.parse(b.created_time) : 0
    return bTime - aTime
  })
}

export function decodeCursor(cursor?: string): Cursor | undefined {
  if (!cursor) {
    return undefined
  }

  const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))

  if (decoded?.anchor) {
    return {
      anchor: decoded.anchor,
      monthAKey: decoded.monthAKey ?? null,
      monthBKey: decoded.monthBKey ?? null,
    }
  }

  return {
    anchor: new Date().toISOString(),
    monthAKey: null,
    monthBKey: null,
  }
}

function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64')
}

async function queryByMonth(
  client: DynamoDBClient,
  limit: number,
  dateGroup: string,
  start: Date,
  end: Date,
  exclusiveStartKey: DynamoCursorKey
) {
  const input = {
    TableName: getEnv('TABLE_NAME'),
    IndexName: 'dateGroup',
    Limit: limit,
    KeyConditionExpression:
      'dateGroup = :dateGroup AND created_time BETWEEN :start AND :end',
    FilterExpression: '#rt <> :releaseType',
    ExpressionAttributeNames: {
      '#rt': 'releaseType',
    },
    ScanIndexForward: false,
    ExpressionAttributeValues: {
      ':releaseType': 'RELEASE NEWS',
      ':dateGroup': dateGroup,
      ':start': start.toISOString(),
      ':end': end.toISOString(),
    },
  }

  if (exclusiveStartKey) {
    Object.assign(input, { ExclusiveStartKey: exclusiveStartKey })
  }

  return client.send(new QueryCommand(input))
}

export async function getRecordsInInterval(
  client: DynamoDBClient,
  count: string | null,
  interval: number,
  encodedCursor?: string
): Promise<RecordsReturned> {
  const limit = !isNaN(Number(count)) ? Number(count) : 20
  const cursor = decodeCursor(encodedCursor)
  const anchor = cursor?.anchor ? new Date(cursor.anchor) : new Date()

  const currentMonth = anchor.getMonth() + 1
  const nextMonth = (currentMonth % 12) + 1

  const endOfMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0
  ).getDate()

  const lookbackMs =
    (!isNaN(interval) && interval ? interval : 24) * 60 * 60 * 1000
  const start = new Date(anchor.getTime() - lookbackMs)
  const isLastDay = anchor.getDate() === endOfMonth

  const monthAResult = await queryByMonth(
    client,
    limit,
    `DATE#${currentMonth}`,
    start,
    anchor,
    cursor?.monthAKey ?? null
  )

  let items = monthAResult.Items as SchemalessRecords[]
  let monthBKey: DynamoCursorKey = null

  if (isLastDay) {
    const monthBResult = await queryByMonth(
      client,
      limit,
      `DATE#${nextMonth}`,
      start,
      anchor,
      cursor?.monthBKey ?? null
    )

    items = items.concat(monthBResult.Items as SchemalessRecords[])
    monthBKey = monthBResult.LastEvaluatedKey ?? null
  }

  const monthAKey = monthAResult.LastEvaluatedKey ?? null
  const sortedItems = sortByCreatedTimeDesc(items)

  const hasMore = monthAKey !== null || (isLastDay && monthBKey !== null)

  return {
    items: sortedItems,
    cursor: hasMore
      ? encodeCursor({
          anchor: anchor.toISOString(),
          monthAKey,
          monthBKey: isLastDay ? monthBKey : null,
        })
      : null,
  }
}
