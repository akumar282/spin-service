import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
  Context,
} from 'aws-lambda'
import { handler } from '../../../infrastructure/lib/lambdas/rawDataIngestion'

test('Lambda Test', async () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    body:
      '{\n    ' +
      '"postTitle": "test",\n   ' +
      ' "content": "test",\n    ' +
      '"link": "test",\n    ' +
      '"created_time": "test",\n    ' +
      '"postId": "test",\n    ' +
      '"pagination": "test",\n    ' +
      '"searchString": "test",\n    ' +
      '"color": "test",\n    ' +
      '"thumbnail": "test"\n  ' +
      '}',
    path: '/raw',
    httpMethod: 'POST',
  }

  const mockContext: Partial<Context> = {
    logGroupName: 'mockLogGroupName',
  }

  const result = await handler(
    <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>(
      mockEvent
    ),
    <Context>mockContext
  )
  expect(result)
}, 15000)
