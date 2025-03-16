import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { aws_scheduler as scheduler, aws_sqs as sqs } from 'aws-cdk-lib'
import { ContainerEnvVars, FargateScheduleProps } from './types'
import {
  Effect,
  Policy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'

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
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    })

    const cluster = new ecs.Cluster(scope, props.clusterId, {
      vpc,
      enableFargateCapacityProviders: true,
    })

    const taskDefinition = new ecs.FargateTaskDefinition(scope, props.taskDefId)

    const schedulerRole = new Role(scope, 'scheduleRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
    })

    const schedulerPolicy = new Policy(scope, 'schedulerPolicy', {
      document: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['ecs:RunTask'],
            resources: [taskDefinition.taskDefinitionArn, cluster.clusterArn],
          }),
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['iam:PassRole'],
            resources: ['*'],
          }),
        ],
      }),
    })

    schedulerRole.attachInlinePolicy(schedulerPolicy)

    taskDefinition.addContainer(props.container.id, {
      image: ecs.ContainerImage.fromAsset(props.container.assetPath),
      environment: {
        ...passthroughProps?.environment,
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ecsSpinService',
        logGroup: passthroughProps?.logs,
      }),
    })

    const securityGroup = new ec2.SecurityGroup(scope, 'SpinTaskSecGroup', {
      vpc,
      allowAllOutbound: true,
    })

    new scheduler.CfnSchedule(scope, 'FargateSchedule', {
      flexibleTimeWindow: {
        mode: 'OFF',
      },
      scheduleExpression: 'rate(20 minutes)',
      target: {
        arn: cluster.clusterArn,
        roleArn: schedulerRole.roleArn,
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
              securityGroups: [securityGroup.securityGroupId],
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
