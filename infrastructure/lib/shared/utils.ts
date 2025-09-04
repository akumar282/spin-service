import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

export function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) {
    throw new Error(`Error: ${name} not defined`)
  }
  return val
}

export const extractCookies = (cookies: string | undefined) => {
  if (cookies === undefined) {
    return { error: 'No Cookie' }
  }
  return Object.fromEntries(
    cookies.split(';').map((cookie) => {
      const [key, value] = cookie.trim().split('=')
      return [key, value]
    })
  )
}

export const cookies = (
  accessToken: string | undefined,
  idToken: string | undefined,
  refreshToken: string | undefined
) => {
  return [
    `accessToken=${accessToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=3600`,
    `idToken=${idToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=3600`,
    `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=2592000`,
  ]
}

export async function requestWithBody(
  path: string,
  url: string,
  body: object,
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE',
  authorization: string
) {
  const postRequest = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
      host: new URL(url).hostname,
    },
    protocol: 'https:',
    hostname: new URL(url).hostname,
    body: JSON.stringify(body),
    path,
  }
  const requestURI = url.concat(postRequest.path)
  return await fetch(requestURI, postRequest)
}

export async function getSsmParam(client: SSMClient, param: string) {
  try {
    const response = await client.send(
      new GetParameterCommand({
        Name: param,
        WithDecryption: true,
      })
    )
    if (response.Parameter) {
      return response.Parameter
    } else {
      return null
    }
  } catch (e) {
    console.error('Get SSM Param failed with error: ', e)
    return null
  }
}

export async function getItem(
  client: DynamoDBDocumentClient,
  conditionExpression: string,
  expressionAttrs: Record<string, any>
) {
  try {
    const command = new QueryCommand({
      TableName: getEnv('TABLE_NAME'),
      KeyConditionExpression: conditionExpression,
      ExpressionAttributeValues: expressionAttrs,
    })
    const response = await client.send(command)
    if (response.Items) {
      return response.Items[0]
    } else {
      return null
    }
  } catch (e) {
    console.info('Error querying dynamo')
    return null
  }
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
}
