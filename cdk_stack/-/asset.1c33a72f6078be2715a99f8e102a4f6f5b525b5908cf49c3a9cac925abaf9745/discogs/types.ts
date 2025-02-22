export type ArtistSuccessResponseBody = {
  name: string
  namevariations: string[]
  profile: string
  releases_url: URL
  resource_url: URL
  uri: URL
  urls: string[]
  data_quality: string
  id: number
  aliases: Member[]
  images: ImageAsset[]
  members: Member[]
}

type ImageAsset = {
  height: number
  resource_url: URL
  type: string
  uri: URL
  uri150: URL
  width: number
}

type Member = {
  active: boolean
  id: number
  name: string
  resource_url: URL
}

type UnsuccessfulResponseBody = {
  message: string
}

export type ResponseBody<T> = T | UnsuccessfulResponseBody

type ResultContributor = {
  resource_url: URL
  username: string
}

type Company = {
  catno: string
  entity_type: string
  entity_type_name: string
  id: number
  name: string
  resource_url: URL
}

type Community = {
  contributors: ResultContributor[]
  data_quality: string
  have: number
  rating: {
    average: number
    count: number
  }
  status: string
  submitter: {
    resource_url: URL
    username: string
  }
  want: number
}

type ExtraArtists = {
  anv: string
  id: number
  join: string
  name: string
  resource_url: URL
  role: string
  tracks: string
}

type format =  {
  descriptions: string[]
  name: string
  qty: string
}

type ArtistTrunc =  {
  anv: string
  id: string
  join: string
  name: string
  resource_url: URL
  role: string
  tracks: string
}

type Video = {
  description: string
  duration: number
  embed: boolean
  title: string
  uri: URL
}

type Label = {
  catno: string
  entity_type: string
  id: number
  name: string
  resource_url: URL
}

type Track = {
  duration: string
  position: string
  title: string
  type_: string
}

type Identifier = {
  type: string
  value: string
}

export type Release = {
  title: string
  id: number
  artists: ArtistTrunc[]
  data_quality: string
  thumb: URL
  community: Community
  companies: Company[]
  country: string
  date_added: string
  date_changed: string
  estimated_weight: number
  extraartists: ExtraArtists[]
  format_quantity: number
  formats: format[]
  genres: string[]
  identifiers: Identifier[]
  images: ImageAsset[]
  labels: Label[]
  lowest_price: number
  master_id: number
  master_url: URL
  notes: string
  num_for_sale: number
  released: string
  released_formatted: string
  resource_url: URL
  series: []
  status: string
  styles: string[]
  tracklist: Track[]
  uri: URL
  videos: Video[]
  year: number
}

export type ResultSearch =  {
  style: string[]
  thumb: string
  title: string
  country: string
  format: string[]
  uri: string
  community: {
    want: number
    have: number
  }
  label: string[]
  catno: string
  year: number
  genre: string[]
  resource_url: URL
  type: string
  id: number
}

export type SearchResult = {
  pagination: {
    per_page: number
    pages: number
    page: number
    urls: {
      last: URL
      next: URL
    }
    items: number
  }
  results: ResultSearch[]
}
