import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getEnv } from '../../shared/utils'

type DynamoCursorKey = Record<string, unknown> | null

type SchemalessRecords = {
  created_time?: string
  [key: string]: unknown
}

export type Cursor = {
  anchor: string
  monthAKey: DynamoCursorKey
  monthBKey: DynamoCursorKey
}

type RecordsReturned = {
  items: SchemalessRecords[]
  cursor: string | null
}

function getAnchorDate(cursor?: Cursor): Date {
  if (!cursor) {
    return new Date()
  }

  const parsed = new Date(cursor.anchor)
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid cursor anchor')
  }

  return parsed
}

function getMonthGroups(anchor: Date): {
  monthA: string
  monthB: string
  isLastDay: boolean
} {
  const currentMonth = anchor.getMonth() + 1
  const nextMonth = (currentMonth % 12) + 1
  const endOfMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0
  ).getDate()

  return {
    monthA: `DATE#${currentMonth}`,
    monthB: `DATE#${nextMonth}`,
    isLastDay: anchor.getDate() === endOfMonth,
  }
}

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

  if (decoded?.anchor && ('monthAKey' in decoded || 'monthBKey' in decoded)) {
    return {
      anchor: decoded.anchor,
      monthAKey: decoded.monthAKey ?? null,
      monthBKey: decoded.monthBKey ?? null,
    }
  }

  return {
    anchor: new Date().toISOString(),
    monthAKey: (decoded as Record<string, unknown>) ?? null,
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
  const anchor = getAnchorDate(cursor)
  const lookbackMs =
    (!isNaN(interval) && interval ? interval : 24) * 60 * 60 * 1000
  const start = new Date(anchor.getTime() - lookbackMs)

  const { monthA, monthB, isLastDay } = getMonthGroups(anchor)

  const monthAResult = await queryByMonth(
    client,
    limit,
    monthA,
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
      monthB,
      start,
      anchor,
      cursor?.monthBKey ?? null
    )

    items = items.concat(monthBResult.Items as SchemalessRecords[])
    monthBKey =
      (monthBResult.LastEvaluatedKey as Record<string, unknown> | undefined) ??
      null
  }

  const monthAKey =
    (monthAResult.LastEvaluatedKey as Record<string, unknown> | undefined) ??
    null
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
