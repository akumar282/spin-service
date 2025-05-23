import * as z from 'zod'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HttpMethod = z.enum([
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'PATCH',
  'OPTIONS',
  'DELETE',
  'CONNECT',
  'TRACE',
])

export type HttpMethod = z.infer<typeof HttpMethod>

enum NotifyTypes {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  INAPP = 'INAPP',
}

export type Records = {
  id: string
  artist: string | null | undefined
  year: string | null | undefined
  media: 'cd' | 'vinyl'
  postTitle: string | null | undefined
  content: string | null | undefined
  created_time: Date
  link: string
  postId: string
  pagination: string | null | undefined
  searchString: string
  color: string | null
  thumbnail: string | null
  genre: string[]
  title: string
  label: string[]
  resource_url: URL
}

export type Ledger = {
  postId: string
  status: string
  processed: boolean
  ttl: string
}

export type User = {
  id: string
  email: string
  phone?: string
  notifyType: NotifyTypes[]
  genres: string[]
  labels: string[]
  artists: string[]
  albums: string[]
}

export type SQSBody = {
  eventID: string
  eventName: string
  eventVersion: string
  eventSource: string
  awsRegion: string
  dynamodb: {
    ApproximateCreationDateTime: number
    Keys: Records
  }
  SequenceNumber: string
  SizeBytes: number
  StreamViewType: string
  eventSourceArn: string
}

export type AuthRequest = {
  type: 'login' | 'new_user'
  platform: 'mobile' | 'web'
  credentials: {
    username: string
    password: string
  }
  clientId: string
}
