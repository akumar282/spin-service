import { PolicyDocument, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
export const pipelineRole = (scope: Construct) => {
  new Role(scope, 'OpenSearchPipeline', {
    roleName: 'OpenSerchPipelineRole',
    assumedBy: new ServicePrincipal('osis-pipelines.amazonaws.com'),
    inlinePolicies: {
      open: new PolicyDocument({}),
    },
  })
}
