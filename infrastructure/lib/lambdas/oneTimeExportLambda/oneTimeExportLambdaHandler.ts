import { APIGatewayProxyResult } from 'aws-lambda'
import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3'
import { apiResponse } from '../../apigateway/responses'
import { getEnv } from '../../shared/utils'

const client = new S3Client({})

export async function handler(): Promise<APIGatewayProxyResult> {
  const indices = ['records', 'users']
  const bucketName = getEnv('BUCKET_NAME')
  try {
    const s3objects = await client.send(
      new ListObjectsCommand({
        Bucket: bucketName,
        MaxKeys: 10,
      })
    )
    console.log(s3objects)
  } catch (e) {
    return apiResponse('Export Failed', 400)
  }
  return apiResponse('Export Ran Successfully', 200)
}
