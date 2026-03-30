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

  public getData<T>(resource: string, params?: {[key: string]: string | number}): Promise<T> {
    let queryString = ''
    if(params) {
      queryString = this._queryStringBuilder(params)
    }
    return this.axiosInstance
      .get(`${resource}${queryString}`)
      .then((response) => response.data)
      .catch(err => { throw new Error('Request Failed with message: ' + err)})
  }

  private _queryStringBuilder(params: {[key: string]: string | number}): string {
    return '?' + Object.keys(params)
      .filter(x => params[x] !== null)
      .map(x => `${x}=${encodeURIComponent(params[x]).toString()}`)
      .join('&')
  }
}