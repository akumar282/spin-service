import * as cdk from 'aws-cdk-lib'
import { RemovalPolicy } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { AttributeType, Billing } from 'aws-cdk-lib/aws-dynamodb'
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

    const recordsTable = new dynamodb.TableV2(this, 'jobsTable', {
      tableName: 'recordsTable',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'created_time',
        type: AttributeType.STRING,
      },
      billing: Billing.onDemand(),
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'expires',
      removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    })

    recordsTable.addGlobalSecondaryIndex({
      indexName: 'album',
      partitionKey: {
        name: 'albumTitle',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    })
  }
}
