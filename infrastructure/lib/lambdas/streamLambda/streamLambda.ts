import { APIGatewayProxyResult, Context, DynamoDBStreamEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'
import { transformAndPost } from './functions'
import { SSMClient } from '@aws-sdk/client-ssm'
import { getSsmParam } from '../../shared/utils'

const ssmClient = new SSMClient()

export async function handler(
  event: DynamoDBStreamEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const ssmParam = await getSsmParam(ssmClient, '/os/endpoint')
  const endpoint = ssmParam ? ssmParam.Value : null

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
    return apiResponse({ e, context }, 200)
  }
  return apiResponse('Export Ran Successfully', 200)
}
