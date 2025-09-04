import { CORS_HEADERS } from '../shared/utils'

export function apiResponse(
  message: any,
  statusCode: number,
  cookies?: string[],
  cors?: boolean
) {
  return {
    headers: {
      'Content-type': 'application/json',
      'Access-Control-Allow-Credentials': 'true',
      ...(cors ? CORS_HEADERS : {}),
    },
    ...(cookies ? { multiValueHeaders: { 'Set-Cookie': cookies } } : {}),
    body: JSON.stringify(message),
    statusCode,
  }
}
