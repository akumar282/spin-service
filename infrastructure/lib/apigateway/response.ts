import { CORS_HEADERS, DYNAMIC_CORS } from '../shared/utils'
import { APIGatewayProxyResult } from 'aws-lambda'

export class ResponseBuilder {
  public response: APIGatewayProxyResult

  constructor(
    body: any,
    statusCode = 200,
    headers?: APIGatewayProxyResult['headers']
  ) {
    this.response = {
      statusCode,
      body: JSON.stringify(body),
      headers: Object.assign({}, headers, {
        'Content-type': 'application/json',
        'Access-Control-Allow-Credentials': 'true',
      }),
    }
  }

  public addHeaders(headers: object) {
    this.response.headers = Object.assign({}, this.response.headers, headers)
    return this
  }

  public addCookies(cookies: []) {
    this.response.multiValueHeaders = Object.assign(
      {},
      this.response.multiValueHeaders,
      { 'Set-Cookie': cookies }
    )
    return this
  }

  public addCors(host?: string) {
    this.response.headers = Object.assign(
      {},
      this.response.headers,
      host ? DYNAMIC_CORS(host) : CORS_HEADERS
    )
    return this
  }

  public addBody(body: any) {
    this.response.body = JSON.stringify(body)
    return this
  }

  public addStatus(status: number) {
    this.response.statusCode = status
    return this
  }
}
