import { CORS_HEADERS, DYNAMIC_CORS } from '../shared/utils'

export function apiResponse(
  message: any,
  statusCode: number,
  cookies?: string[],
  cors?: boolean,
  host?: string
) {
  return {
    headers: {
      'Content-type': 'application/json',
      'Access-Control-Allow-Credentials': 'true',
      ...(cors ? (host ? DYNAMIC_CORS(host) : CORS_HEADERS) : {}),
    },
    ...(cookies ? { multiValueHeaders: { 'Set-Cookie': cookies } } : {}),
    body: JSON.stringify(message),
    statusCode,
  }
}
