import { aws_osis as osis } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export const openSearchPipeline = (
  scope: Construct,
  pipelineConfig: string,
  logGroup: string,
  pipelineName: string,
  id: string
) => {
  return new osis.CfnPipeline(scope, id, {
    maxUnits: 4,
    minUnits: 1,
    pipelineConfigurationBody: pipelineConfig,
    pipelineName,
    logPublishingOptions: {
      cloudWatchLogDestination: {
        logGroup,
      },
      isLoggingEnabled: true,
    },
  })
}
