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