export type PostInfo = {
  postTitle: string | null | undefined
  content: string | null | undefined
  created_time: Date | string
  link: string
  postId: string | null | undefined
  pagination: string | null | undefined
  searchString: string
  color: string | null
  thumbnail: string | null
  genre: string[]
  title: string
  year: string
  artist: string | null
  label: string[]
  resource_url: URL | null
  uri: string
  media: string
  dateGroup: string
  expires: number
  preorder: boolean
  secondaryId: string
  source: string
  album: string
  releaseType: string | null
  edition: string | null
  releaseDate: string | null
  format: string | null
  moreContent: string | null
  region: string | null
  isAnnouncement: boolean
  productImage: string
  customTitle: string
}
