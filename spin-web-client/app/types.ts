export type Master = {
  country: string,
  year: string,
  format: string[],
  label: string[],
  type: 'master',
  genre: string[],
  style: string[],
  id: number,
  barcode: string[],
  master_id: number,
  master_url: string,
  uri: string,
  catno: string,
  title: string,
  thumb: string,
  cover_image: string,
  resource_url: string,
  community: {
    want: number,
    have: number
  }
}

export type Release = {
  country: string,
  year: string,
  format: string[],
  label: string[],
  type: 'release',
  genre: string[],
  style: string[],
  id: number,
  barcode: string[],
  master_id: number,
  master_url: string,
  uri: string,
  catno: string,
  title: string,
  thumb: string,
  cover_image: string,
  resource_url: string,
  community: {
    want: number,
    have: number
  },
  format_quantity: number,
  formats: [
    {
      name: string,
      qty: string,
      descriptions: string[]
    }
  ]
}

export type Artist =   {
  id: number,
  type: 'artist',
  master_id: number | null,
  master_url: string | null,
  uri: string,
  title: string,
  thumb: string,
  cover_image: string,
  resource_url: string
}

export type ReleaseNotification = {
  album: string,
  type: string
}

export type GenreNotification = {
  genre: string,
  type: string,
}

export type ArtistNotification = {
  artist: string,
  type: string,
}

export type LabelNotification = {
  label: string,
  type: string,
}

export type AllNotifications = LabelNotification | ArtistNotification | GenreNotification | ReleaseNotification

export type Records = {
  id: string
  artist: string | null | undefined
  year: string | null | undefined
  media: 'cd' | 'vinyl'
  postTitle: string
  content: string | null | undefined
  created_time: string
  link: string
  postId: string
  pagination: string | null | undefined
  searchString: string
  color: string | null
  thumbnail: string | null
  genre: string[]
  title: string
  label: string[]
  resource_url: string
}

export type RecordsResult = {
  items: Records[],
  cursor: string | null
}

export type SearchResult = {
  results: (Artist | Release | Master)[]
  cursor: string | null
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

export type AuthResponse = {
  status: number
}

export type SessionResponse = {
  token: string
}

export type ResponseData<T> = {
  status: number,
  data: T
}

export type Item = {
  [p: string]: string
  type: string
}

export type User = {
  data: {
    id: string
    email: string
    phone?: string
    user_name: string
    notifyType: string[]
    genres: string[]
    labels: string[]
    artists: ArtistNotification[]
    albums: ReleaseNotification[]
    deviceId?: string
  }
}

export type UpdateUser = {
  $metadata:{
    attempts: number
    httpStatusCode: number
    requestId: string,
    totalRetryDelay: number
  }
  Attributes: {
    id: string
    email: string
    phone?: string
    user_name: string
    notifyType: string[]
    genres: string[]
    labels: string[]
    artists: string[]
    albums: string[]
    deviceId?: string
  }
}

export function unwrap<T>(data: ResponseData<T>) {
  return data.data
}

// {
//   "sub": "88d1d390-10f1-700f-8327-7af3bc9b201f",
//   "token": "eyJraWQiOiJVazdJbHo4aXlGY1dma1pwOUJVWXJ5ZHFzVVloMWV1Z1MxKzExM0JNdVk4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4OGQxZDM5MC0xMGYxLTcwMGYtODMyNy03YWYzYmM5YjIwMWYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImN1c3RvbTp2ZXJzaW9uIjoiMSIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX3ZZVnIyMmM0MiIsInBob25lX251bWJlcl92ZXJpZmllZCI6ZmFsc2UsImNvZ25pdG86dXNlcm5hbWUiOiI4OGQxZDM5MC0xMGYxLTcwMGYtODMyNy03YWYzYmM5YjIwMWYiLCJvcmlnaW5fanRpIjoiZjg0YTNjNGYtZDQ0MC00MDA3LTg0MWQtNWJmYmFlMTFmYzQyIiwiYXVkIjoiNTNudDc3Y3BjNG9oZ2g5MXN1YzJ0a3JjNWIiLCJldmVudF9pZCI6IjkwMTdiZTQyLTJkOTMtNDIyOC1iZWViLTkyOTZmZGQyYzM5NCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzYyODU2NTM1LCJwaG9uZV9udW1iZXIiOiIrMTQyNTczNzIxMTAiLCJleHAiOjE3NjI4NjM3MzUsImN1c3RvbTpyb2xlIjoidXNlciIsImlhdCI6MTc2Mjg1NjUzNSwianRpIjoiYjNlMGNmNzMtYzMzMy00MWY0LWEwZTktNDE5N2RmMGQ2ZDAyIiwiZW1haWwiOiJhY3R1YWxseWNob3dtZWluQGdtYWlsLmNvbSJ9.T0DFt1GVlZXoGpaAS_TBnHCbyMLhK7evR1yefu8OpW_K7NYKmYjhK2Mjhj6851um2j7LBqq1cfsS87IvAXmhKYLE9fZSA1TS9HRtzbj_BWdrEiCu4xDKtXlovGwKAAEMaAX-vwxaVeiSdVWvD1iXWxV_vjh7W9I_r1AZ8bdWmPrNwOINO_apEsH8T1fphXHjSRKgiCjNbFhBFrIueyM0P0PaODuBAjxfJeuLFOYE835I4FY4bBhHSUExHqi7SLX05Bw1gY6duD-HYQgoMagnjfLipGCzdVPgOmhA-9BhPREhZGjyX9QR6n-xNkxIee-4EHa51koKdfYM1yDqStwtSQ",
//   "username": "88d1d390-10f1-700f-8327-7af3bc9b201f",
//   "data": {
//   "albums": [],
//     "artists": [],
//     "email": "actuallychomein@gmail.com",
//     "genres": [],
//     "id": "88d1d390-10f1-700f-8327-7af3bc9b201f",
//     "labels": [],
//     "notifyType": [],
//     "phone": "+14257372110",
//     "user_name": "+14257372110"
// },
//   "artists": [],
//   "notifyType": [],
//   "labels": [],
//   "albums": [],
//   "email": "actuallychowmein@gmail.com",
//   "id": "88d1d390-10f1-700f-8327-7af3bc9b201f",
//   "genres": [],
//   "phone": "+14257372110",
//   "user_name": "+14257372110"
// }