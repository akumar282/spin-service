import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { FargateService } from 'aws-cdk-lib/aws-ecs'
import { aws_scheduler as scheduler, aws_sqs as sqs } from 'aws-cdk-lib'
import { ContainerEnvVars, FargateScheduleProps } from './types'

export class FargateTask {
  constructor(
    scope: Construct,
    id: string,
    props: FargateScheduleProps,
    passthroughProps?: ContainerEnvVars
  ) {
    const vpc = new ec2.Vpc(scope, props.vpcId, {
      maxAzs: 2,
      natGateways: 1,
    })

    const cluster = new ecs.Cluster(scope, props.clusterId, {
      vpc,
      enableFargateCapacityProviders: true,
    })

    const taskDefinition = new ecs.FargateTaskDefinition(scope, props.taskDefId)

    taskDefinition.addContainer(props.container.id, {
      image: ecs.ContainerImage.fromAsset(props.container.assetPath),
      environment: {
        ...passthroughProps?.environment,
      },
    })

    new FargateService(scope, id, {
      cluster,
      taskDefinition,
      minHealthyPercent: 100,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 2,
        },
        {
          capacityProvider: 'FARGATE',
          weight: 1,
        },
      ],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    })

    new scheduler.CfnSchedule(scope, 'FargateSchedule', {
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      scheduleExpression: 'rate(15 minutes)',
      target: {
        arn: taskDefinition.taskDefinitionArn,
        roleArn: taskDefinition.taskDefinitionArn,
        ...(props.enableDlq
          ? { deadLetterConfig: { arn: this.addDlq(scope, 'EventDlq') } }
          : {}),
        ecsParameters: {
          taskDefinitionArn: taskDefinition.taskDefinitionArn,
          launchType: 'FARGATE',
          networkConfiguration: {
            awsvpcConfiguration: {
              subnets: vpc.selectSubnets({
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
              }).subnetIds,
              securityGroups: [
                new ec2.SecurityGroup(scope, 'SpinTaskSecGroup', { vpc })
                  .securityGroupId,
              ],
            },
          },
        },
      },
    })
  }

  addDlq(scope: Construct, id: string): string {
    const dlq = new sqs.Queue(scope, id)
    return dlq.queueArn
  }
}
