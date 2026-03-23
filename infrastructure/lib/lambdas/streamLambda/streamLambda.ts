import { APIGatewayProxyResult, Context, DynamoDBStreamEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'
import { transformAndPost } from './functions'
import { getEnv } from '../../shared/utils'

export async function handler(
  event: DynamoDBStreamEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const endpoint = getEnv('OPENSEARCH_ENDPOINT')

  try {
    if (endpoint) {
      const modifiedItems = event.Records.filter(
        (x) => x.eventName === 'MODIFY'
      )
      const newItems = event.Records.filter((x) => x.eventName === 'INSERT')
      await transformAndPost(modifiedItems, endpoint, true)
      await transformAndPost(newItems, endpoint, false)
    } else {
      return apiResponse('Endpoint is not defined', 500)
    }
  } catch (e) {
    return apiResponse({ e, context }, 500)
  }
  return apiResponse('Export Ran Successfully', 200)
}
