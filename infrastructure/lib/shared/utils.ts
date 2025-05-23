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
