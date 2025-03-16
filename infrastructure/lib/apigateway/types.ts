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

export type Records = {
  id: string
  artist: string | null | undefined
  year: string | null | undefined
  media: 'cd' | 'vinyl'
  postTitle: string | null | undefined
  content: string | null | undefined
  created_time: Date
  link: string
  postId: string | null | undefined
  pagination: string | null | undefined
  searchString: string
  color: string | null
  thumbnail: string | null
  genre: string[]
  title: string
  label: string[]
  resource_url: URL
}
