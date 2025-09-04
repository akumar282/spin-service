import { APIGatewayProxyEvent } from 'aws-lambda'
import { getEnv } from '../../shared/utils'
import { apiResponse } from '../../apigateway/responses'

export async function handler(event: APIGatewayProxyEvent) {
  console.log(event)
  const params = event.queryStringParameters
  if (params) {
    const queryParams = Object.keys(params)
      .filter((x) => params[x] !== null && params[x] !== undefined)
      .map((x) => `${x}=${encodeURIComponent(params[x]!).toString()}`)
      .join('&')
    const endpoint = 'https://api.discogs.com/database/search?'
    const discogsResponse = await fetch(
      `${endpoint + queryParams}&key=${getEnv(
        'DISCOGS_CONSUMER_KEY'
      )}&secret=${getEnv('DISCOGS_SECRET')}`
    )
    const data = await discogsResponse.json()
    delete data.pagination

    return apiResponse(data, 200, undefined, true)
  }
  return apiResponse('Server Error', 500, undefined, true)
}
