import axios from 'axios'

export class SpinClient {
  readonly axiosInstance

  public constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    })
    this.axiosInstance.interceptors.request.use(function (config) {
      config.headers.Authorization = `Bearer ${localStorage.getItem('id')}`
      return config
    })
  }

  public async getData<T>(resource: string, params?: { [key: string]: string | number }): Promise<T> {
    let queryString = ''
    if(params) {
      queryString = this._queryStringBuilder(params)
    }
    return this.axiosInstance
      .get(`${resource}${queryString}`)
      .then((response) => response.data)
      .catch(err => { throw new Error('Request Failed with message: ' + err)})
  }

  public async postData<T>(resource: string, body?: object): Promise<T> {
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