import { APIGatewayProxyResult } from 'aws-lambda'
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { gunzip } from 'zlib'
import { requestWithBody, streamToBuffer } from './utils'
import { promisify } from 'util'

const client = new S3Client({})

export async function handler(): Promise<APIGatewayProxyResult> {
  const endpoint = getEnv('OPEN_SEARCH_ENDPOINT')
  const bucketName = getEnv('BUCKET_NAME')
  const gunzipAsync = promisify(gunzip)

  try {
    const s3objects: ListObjectsCommandOutput = await client.send(
      new ListObjectsCommand({
        Bucket: bucketName,
        MaxKeys: 30,
      })
    )
    if (!s3objects.Contents) {
      return apiResponse('No content to export', 200)
    }
    const keys = s3objects.Contents?.map((x) => x.Key).filter((x) =>
      x?.includes('json.gz')
    )
    const objs = []
    if (keys) {
      for (const key of keys) {
        const response: GetObjectCommandOutput = await client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          })
        )
        if (response.Body) {
          const bodyStream = response.Body as Readable
          const compressedBuffer = await streamToBuffer(bodyStream)
          const decompressedBuffer = await gunzipAsync(compressedBuffer)
          const rawData = decompressedBuffer.toString('utf-8').split(/\r?\n/)
          for (const line of rawData) {
            if (line.trim() === '') continue
            const dynamoJson = JSON.parse(line)
            objs.push(unmarshall(dynamoJson.Item))
          }
        } else {
          console.info('No Body')
        }
      }
    }

    for (const item of objs) {
      const queryString = `records/_doc/${item.postId}`
      await requestWithBody(queryString, endpoint, item, 'POST')
    }
  } catch (e) {
    return apiResponse('Export Failed', 400)
  }
  return apiResponse('Export Ran Successfully', 200)
}
