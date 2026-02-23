import { APIGatewayProxyEvent } from 'aws-lambda'
import { getEnv } from '../../shared/utils'
import { apiResponse } from '../../apigateway/responses'

export async function handler(event: APIGatewayProxyEvent) {
  console.log(event)
  const params = event.queryStringParameters
  if (params) {
    const nextToken = event.queryStringParameters?.cursor

    let cursor
    if (nextToken) {
      cursor = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf8'))
    }

    delete params.cursor

    Object.assign(params, cursor)

    const queryParams = Object.keys(params)
      .filter((x) => params[x] !== null && params[x] !== undefined)
      .map((x) => `${x}=${encodeURIComponent(params[x]!).toString()}`)
      .join('&')

    const endpoint = 'https://api.discogs.com/database/search?'

    const requestUrl = `${endpoint + queryParams}&key=${getEnv(
      'DISCOGS_CONSUMER_KEY'
    )}&secret=${getEnv('DISCOGS_SECRET')}`

    const discogsResponse = await fetch(requestUrl)
    const data = await discogsResponse.json()

    let discogParams

    if (data.pagination.urls.next) {
      discogParams = new URLSearchParams(
        data.pagination.urls.next.split('?')[1]
      )

      const toObject = Object.fromEntries(discogParams)

      delete toObject.key
      delete toObject.secret

      data.cursor = Buffer.from(JSON.stringify(toObject), 'utf-8').toString(
        'base64'
      )
    }

    delete data.pagination

    return apiResponse(data, 200, undefined, true, event.headers.origin)
  }
  return apiResponse('Server Error', 500, undefined, true, event.headers.origin)
}
