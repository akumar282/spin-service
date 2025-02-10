import axios from 'axios'

export type Auth = {
  personalToken: string
}

export class DiscogsClient {
  private axiosInstance

  public constructor(auth?: Auth) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.discogs.com/',
      headers: {
        'User-Agent': 'MusicNotificationService',
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: `Discogs token=${auth.personalToken}`} : {})
      },
    })
  }
}