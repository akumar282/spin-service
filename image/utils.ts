export enum requestHttpMethod {
  POST = 'POST',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export async function getRequest(path: string, url: string, id: string) {
  const constructedPath = path.concat(id)
  const getRequest = {
    method: requestHttpMethod.GET,
    headers: {
      'Content-Type': 'application/json',
      'host' : new URL(url).hostname,
    },
    protocol: 'https:',
    hostname: new URL(url).hostname,
    path: constructedPath
  }
  const requestURI = url.concat(getRequest.path)
  return await fetch(requestURI, getRequest)
}

export async function requestWithBody(
  path: string,
  url: string,
  body: object,
  method: requestHttpMethod
) {
  const postRequest = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'host' : new URL(url).hostname,
    },
    protocol: 'https:',
    hostname: new URL(url).hostname,
    body: JSON.stringify(body),
    path: path
  }
  const requestURI = url.concat(postRequest.path)
  return await fetch(requestURI, postRequest)
}