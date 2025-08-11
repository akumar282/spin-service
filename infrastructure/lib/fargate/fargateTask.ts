import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { aws_scheduler as scheduler, aws_sqs as sqs } from 'aws-cdk-lib'
import { ContainerEnvVars, FargateScheduleProps } from './types'
import {
  Effect,
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
    vpc: ec2.Vpc,
    cluster: ecs.Cluster,
    passthroughProps?: ContainerEnvVars
  ) {
    const taskDefinition = new ecs.FargateTaskDefinition(scope, props.taskDefId)

    const schedulerRole = new Role(scope, 'scheduleRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
      inlinePolicies: {
        FargateScrapePolicy: new PolicyDocument({
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
      },
    })

    taskDefinition.addContainer(props.container.id, {
      image: ecs.ContainerImage.fromAsset(props.container.assetPath),
      environment: {
        ...passthroughProps?.environment,
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: `ecsSpinService/${props.container.id}`,
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
      scheduleExpression: 'rate(30 minutes)',
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
