import { NotifyTypes } from '../../apigateway/types'
import { getEnv } from '../../shared/utils'
import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb'

export function updateVals(
  params: NotifyTypes[],
  id: string,
  // eslint-disable-next-line camelcase
  user_name: string
) {
  return {
    ExpressionAttributeNames: {
      '#no': 'notifyType',
    },
    ExpressionAttributeValues: {
      ':no': params,
    },
    Key: {
      id,
      // eslint-disable-next-line camelcase
      user_name,
    },
    ReturnValues: 'ALL_NEW',
    TableName: getEnv('TABLE_NAME'),
    UpdateExpression: 'SET #no = :no',
  } as UpdateCommandInput
}
