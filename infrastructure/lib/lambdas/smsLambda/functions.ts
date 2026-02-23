/* eslint-disable */
import { NotifyTypes } from '../../apigateway/types'
import { getEnv } from '../../shared/utils'
import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb'

export function updateVals(
  params: NotifyTypes[],
  id: string,
  user_name: string,
  optOutTrue: boolean
): UpdateCommandInput {
  const ExpressionAttributeNames: Record<string, string> = {
    '#no': 'notifyType',
  }

  const ExpressionAttributeValues: Record<string, any> = {
    ':no': params,
  }

  let UpdateExpression = 'SET #no = :no'

  if (optOutTrue) {
    ExpressionAttributeNames['#opt'] = 'prevOptedOut'
    ExpressionAttributeValues[':opt'] = true
    UpdateExpression += ', #opt = :opt'
  } else if (!optOutTrue) {
    ExpressionAttributeNames['#opt'] = 'prevOptedOut'
    ExpressionAttributeValues[':opt'] = false
    UpdateExpression += ', #opt = :opt'
  }

  return {
    TableName: getEnv('TABLE_NAME'),
    Key: {
      id,
      user_name,
    },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  }
}
