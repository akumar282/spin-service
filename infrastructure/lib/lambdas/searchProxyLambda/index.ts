import { APIGatewayProxyEvent } from 'aws-lambda'
import { getEnv } from '../../shared/utils'
import { apiResponse } from '../../apigateway/responses'

export async function handler(event: APIGatewayProxyEvent) {
  console.log(event)
  if (event.queryStringParameters && event.queryStringParameters.q) {
    const endpoint = 'https://api.discogs.com/database/search?q='
    const discogsResponse = await fetch(
      `${endpoint + event.queryStringParameters.q}&key=${getEnv(
        'DISCOGS_CONSUMER_KEY'
      )}&secret=${getEnv('DISCOGS_SECRET')}`
    )
    const data = await discogsResponse.json()

    return apiResponse(data, 200)
  }
  return apiResponse('Server Error', 500)
}
