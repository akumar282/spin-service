import { aws_osis as osis } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export const openSearchPipeline = (
  scope: Construct,
  pipelineConfig: string,
  logGroup: string,
  pipelineName: string
) => {
  new osis.CfnPipeline(scope, 'OpenSearchPipelineConstruct', {
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
