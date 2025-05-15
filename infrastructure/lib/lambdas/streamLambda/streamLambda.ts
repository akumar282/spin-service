import { APIGatewayProxyResult, Context, DynamoDBStreamEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'
import { transformAndPost } from './functions'

export async function handler(
  event: DynamoDBStreamEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const endpoint = `https://${getEnv('OPEN_SEARCH_ENDPOINT')}/`

  try {
    const modifiedItems = event.Records.filter((x) => x.eventName === 'MODIFY')
    const newItems = event.Records.filter((x) => x.eventName === 'INSERT')
    await transformAndPost(modifiedItems, endpoint, true)
    await transformAndPost(newItems, endpoint, false)
  } catch (e) {
    return apiResponse({ e, context }, 200)
  }
  return apiResponse('Export Ran Successfully', 200)
}
