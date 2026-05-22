import { Construct } from 'constructs'
import { IgnoreMode, aws_scheduler as scheduler, aws_sqs as sqs } from 'aws-cdk-lib'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { ContainerEnvVars, FargateScheduleProps } from './types'
import { Role } from 'aws-cdk-lib/aws-iam'
import * as path from 'node:path'

export class FargateTask extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: FargateScheduleProps,
    vpc: ec2.Vpc,
    cluster: ecs.Cluster,
    role: Role,
    securityGroup: SecurityGroup,
    subnetType: ec2.SubnetType,
    passthroughProps?: ContainerEnvVars
  ) {
    super(scope, `FargateScraperConstruct-${id}`)
    const taskDefinition = new ecs.FargateTaskDefinition(scope, props.taskDefId)
    const imageDirectory = path.dirname(props.container.assetPath)

    taskDefinition.addContainer(props.container.id, {
      image: ecs.ContainerImage.fromAsset('.', {
        file: props.container.assetPath,
        ignoreMode: IgnoreMode.DOCKER,
        exclude: [
          '**',
          '!package.json',
          '!package-lock.json',
          '!packages',
          '!packages/**',
          '!images',
          `!${imageDirectory}`,
          `!${imageDirectory}/**`,
          '**/node_modules',
          '**/dist',
          '.git',
          '.gitignore',
          'cdk.out',
          '.build',
          '**/.DS_Store',
        ],
      }),
      environment: {
        ...passthroughProps?.environment,
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: `ecsSpinService/${props.container.id}`,
        logGroup: passthroughProps?.logs,
      }),
    })

    new scheduler.CfnSchedule(scope, `FargateSchedule-${id}`, {
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      scheduleExpression: props.scheduleExpression ?? 'rate(30 minutes)',
      target: {
        arn: cluster.clusterArn,
        roleArn: role.roleArn,
        ...(props.enableDlq
          ? { deadLetterConfig: { arn: this.addDlq(scope, `EventDlq-${id}`) } }
          : {}),
        ecsParameters: {
          taskDefinitionArn: taskDefinition.taskDefinitionArn,
          launchType: 'FARGATE',
          networkConfiguration: {
            awsvpcConfiguration: {
              subnets: vpc.selectSubnets({
                subnetType,
              }).subnetIds,
              securityGroups: [securityGroup.securityGroupId],
              ...(subnetType === SubnetType.PUBLIC
                ? {
                    assignPublicIp: 'ENABLED',
                  }
                : {}),
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
