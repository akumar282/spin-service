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

  public getData<T>(resource: string, params?: {}): Promise<T> {
    return this.axiosInstance
      .get(resource, { params })
      .then((response) => response.data)
      .catch(err => { throw new Error('Request Failed with message: ' + err)})
  }

  _queryStringBuilder(): string {

  }
}