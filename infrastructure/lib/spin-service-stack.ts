import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import { Construct } from 'constructs'

export class SpinServiceStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, 'spinVpc', {
      maxAzs: 2,
    })

    const cluster = new ecs.Cluster(this, 'spinCluster', {
      vpc,
    })

    const spinServiceFargate =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        'spinFargateService',
        {
          cluster,
          cpu: 512,
          desiredCount: 1,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset('./'),
          },
        }
      )
  }
}
