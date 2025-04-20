import { getEnv } from '../../shared/utils'

export async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export async function requestWithBody(
  path: string,
  url: string,
  body: object,
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE'
) {
  const postRequest = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(
        `${getEnv('USER')}:${getEnv('DASHPASS')}`
      ).toString('base64')}`,
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
