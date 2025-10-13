import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export const gatewayRole = (scope: Construct): Role => {
  return new Role(scope, 'AuthorizerRole', {
    assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    inlinePolicies: {
      LambdaPolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: 'Invocation',
            actions: ['lambda:InvokeFunction'],
            effect: Effect.ALLOW,
            resources: ['*'],
          }),
        ],
      }),
    },
  })
}
