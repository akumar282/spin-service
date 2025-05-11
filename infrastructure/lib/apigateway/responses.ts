export function apiResponse(
  message: any,
  statusCode: number,
  cookies?: string[]
) {
  return {
    headers: {
      'Content-type': 'application/json',
      'Access-Control-Allow-Credentials': 'true',
    },
    ...(cookies ? { multiValueHeaders: { 'Set-Cookie': cookies } } : {}),
    body: JSON.stringify(message),
    statusCode,
  }
}
