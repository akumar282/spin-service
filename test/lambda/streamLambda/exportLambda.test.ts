import { handler } from '../../../infrastructure/lib/lambdas/streamLambda'
import * as process from 'node:process'
import { Context } from 'aws-lambda'
import { mockClient } from 'aws-sdk-client-mock'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import * as Utils from '../../../infrastructure/lib/shared/utils'
import { mockEvent, wrappedStreamReturn } from '../../testData/constants'

describe('environmental variables', () => {
  const ssmMock = mockClient(SSMClient)

  beforeEach(() => {
    ssmMock.reset()
  })

  test('Will send stream Successfully', async () => {
    process.env.DASHPASS = 'xxxxxxxx'
    process.env.USER = 'xxxxx'

    jest.spyOn(Utils, 'requestWithBody').mockResolvedValue(wrappedStreamReturn)

    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: '/os/endpoint',
        Value:
          'https://r0v2604715.execute-api.us-west-2.amazonaws.com/prod/os/',
      },
    })

    const mockContext: Partial<Context> = {
      logGroupName: 'mockLogGroupName',
    }

    const result = await handler(mockEvent, <Context>mockContext)
    console.log(result)
    expect(result.statusCode).toEqual(200)
  })

  test('will receive process.env variables', async () => {
    const mockContext: Partial<Context> = {
      logGroupName: 'mockLogGroupName',
    }

    const result = await handler(mockEvent, <Context>mockContext)
    expect(result)
  }, 35000)
})
