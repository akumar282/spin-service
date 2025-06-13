export async function requestWithBody(
  path: string,
  url: string,
  body: object,
  method: string,
  authorization: string
) {
  const postRequest = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    protocol: 'https:',
    hostname: new URL(url).hostname,
    body: JSON.stringify(body),
    path,
  }
  const requestURI = url.concat(postRequest.path)
  return await fetch(requestURI, postRequest)
}

export function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) {
    throw new Error(`Error: ${name} not defined`)
  }
  return val
}