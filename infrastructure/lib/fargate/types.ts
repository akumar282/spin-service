export type FargateScheduleProps = {
  taskDefId: string
  vpcId: string
  clusterId: string
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
}
