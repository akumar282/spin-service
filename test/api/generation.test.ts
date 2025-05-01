import { App, Stack } from 'aws-cdk-lib'
import { FullApiDefinition } from '../../infrastructure/lib/apigateway/schemaType'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { MockIntegration } from 'aws-cdk-lib/aws-apigateway'
import { Template } from 'aws-cdk-lib/assertions'
import { Api } from '../../infrastructure/lib/apigateway/api'

describe('generation test', () => {
  test('test generation', async () => {
    // Set the variables
    const testApp = new App()
    const stack = new Stack(testApp, 'TestStack')

    const mockIntegration = new MockIntegration({
      integrationResponses: [],
      requestTemplates: {},
    })

    const ApiDef: FullApiDefinition = {
      id: 'spin-records-api',
      props: {
        restApiName: 'spinRecordsApi',
        description: 'Master api for data ingestion, and user endpoints',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowCredentials: true,
      },
      resources: [
        {
          pathPart: 'raw',
          methods: [
            {
              method: 'POST',
              integration: mockIntegration,
            },
          ],
        },
      ],
    }

    new Api(stack, ApiDef)

    const template = Template.fromStack(stack)

    console.info(template)

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST',
    })
  })
})
