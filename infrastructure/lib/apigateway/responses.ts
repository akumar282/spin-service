export function apiResponse(message: any, statusCode: number) {
  return {
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(message),
    statusCode,
  }
}
