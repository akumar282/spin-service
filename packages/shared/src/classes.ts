export interface Sourcer {
  getColor(text: string): string
  getArtist(text: string): string
  getAlbum(text: string): string
  getMedia(text: string): string
  extractData(rawData: object[]): void
}
