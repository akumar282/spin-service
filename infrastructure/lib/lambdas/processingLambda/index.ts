import { Context, SQSEvent } from 'aws-lambda'
import { apiResponse } from '../../apigateway/responses'

export async function handler(event: SQSEvent, context: Context) {
  return apiResponse('Records processed successfully', 200)
}
