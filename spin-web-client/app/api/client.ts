import axios from 'axios'
import type { ResponseData } from '~/types'

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

  public async getData<T>(resource: string, params?: { [key: string]: string | number }): Promise<ResponseData<T>> {
    let queryString = ''
    if(params) {
      queryString = this._queryStringBuilder(params)
    }
    return this.axiosInstance
      .get(`${resource}${queryString}`)
      .then((response) => ({
        status: response.status,
        data: response.data
      }))
      .catch(err => ({
        status: 502,
        data: err
      }))
  }

  public async postData<T>(resource: string, body?: object): Promise<ResponseData<T>> {
    return this.axiosInstance
      .post(resource, body)
      .then((response) => ({
        status: response.status,
        data: response.data
      }))
      .catch(err => ({
        status: 502,
        data: err
      }))
  }

  public async patchData<T>(resource: string, body?: object): Promise<ResponseData<T>> {
    return this.axiosInstance
      .patch(resource, body)
      .then((response) => ({
        status: response.status,
        data: response.data
      }))
      .catch(err => ({
        status: 502,
        data: err
      }))
  }

  private _queryStringBuilder(params: {[key: string]: string | number}): string {
    return '?' + Object.keys(params)
      .filter(x => params[x] !== null)
      .map(x => `${x}=${encodeURIComponent(params[x]).toString()}`)
      .join('&')
  }
}