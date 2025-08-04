import { App, Stack } from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import {
  HttpApi,
  HttpDefinition,
} from '../../infrastructure/lib/apigateway/httpApi'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

describe('http generation test', () => {
  test('test generation', async () => {
    const testApp = new App()
    const stack = new Stack(testApp, 'TestStack')

    const lambda = new NodejsFunction(stack, 'hello')

    const integration = new HttpLambdaIntegration('hello', lambda)

    const apiDef: HttpDefinition = {
      id: 'testDef',
      definition: {
        apiName: 'testApi',
      },
      routes: {
        definition: [
          {
            path: '/fnaf/game/{id}',
            methods: [HttpMethod.GET],
            integration,
          },
        ],
      },
    }

    new HttpApi(stack, apiDef)

    const template = Template.fromStack(stack)

    console.info(template.toJSON())

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /fnaf/game/{id}',
    })
  })
})
