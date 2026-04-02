export type DynamoCursorKey = Record<string, unknown> | null

export type SchemalessRecords = {
  created_time?: string
  [key: string]: unknown
}

export type Cursor = {
  anchor: string
  monthAKey: DynamoCursorKey
  monthBKey: DynamoCursorKey
}

export type RecordsReturned = {
  items: SchemalessRecords[]
  cursor: string | null
}
