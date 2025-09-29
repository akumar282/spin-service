import axios from 'axios'
import Cookies from 'js-cookie'

export class SpinClient {
  readonly axiosInstance

  public constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SpinClient'
      }
    })
    this.axiosInstance.interceptors.request.use(function (config) {
      config.headers.Authorization = `Bearer ${Cookies.get('idToken')}`
      return config
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

  public postData<T>(resource: string, body?: object): Promise<T> {
    return this.axiosInstance
      .post(resource, body)
      .then((response) => response.data)
  }

  private _queryStringBuilder(params: {[key: string]: string | number}): string {
    return '?' + Object.keys(params)
      .filter(x => params[x] !== null)
      .map(x => `${x}=${encodeURIComponent(params[x]).toString()}`)
      .join('&')
  }
}