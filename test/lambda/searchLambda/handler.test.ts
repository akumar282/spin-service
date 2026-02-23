import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
} from 'aws-lambda'
import { handler } from '../../../infrastructure/lib/lambdas/searchProxyLambda'

test('[IT] Lambda Test', async () => {
  process.env.DISCOGS_CONSUMER_KEY = ''
  process.env.DISCOGS_SECRET = ''
  process.env.CLOUD_DISTRO = ''

  const mockEvent: Partial<APIGatewayProxyEvent> = {
    path: '/search/search',
    resource: '/search/{proxy+}',
    httpMethod: 'GET',
    queryStringParameters: {
      q: 'Wii',
      // cursor: 'eyJxIjoiV2lpIiwicGFnZSI6IjIiLCJwZXJfcGFnZSI6IjUwIn0=',
    },
    headers: {
      origin: 'https://www.spinmyrecords.com',
    },
  }

  const result = await handler(
    <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>mockEvent
  )
  expect(result.statusCode).toEqual(200)
})
