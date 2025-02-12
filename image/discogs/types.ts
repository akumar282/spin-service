type ArtistSuccessResponseBody = {
  namevariations: [string],
  profile: string,
  releases_url: URL,
  resource_url: URL,
  uri: URL,
  urls: [string],
  data_quality: string,
  id: 108713,
  images: [ImageAsset],
  members: [Member],
}

type ImageAsset = {
  height: number,
  resource_url: URL,
  type: string,
  uri: URL,
  uri150: URL,
  width: number
}

type Member = {
  active: boolean,
  id: number,
  name: string,
  resource_url: URL
}

type UnsuccessfulResponseBody = {
  message: string,
}

export type ResponseBody<T> = T | UnsuccessfulResponseBody