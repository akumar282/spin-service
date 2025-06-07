import { LogGroup } from 'aws-cdk-lib/aws-logs'

export type FargateScheduleProps = {
  taskDefId: string
  container: {
    id: string
    assetPath: string
  }
  enableDlq: boolean
}

export type ContainerEnvVars = {
  environment: {
    [p: string]: string
  }
  logs: LogGroup
}
