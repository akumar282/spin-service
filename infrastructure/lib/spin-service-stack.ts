import * as cdk from 'aws-cdk-lib'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { AttributeType, Billing } from 'aws-cdk-lib/aws-dynamodb'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { Resource } from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'

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

    const recordsTable = new dynamodb.TableV2(this, 'recordsTable', {
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

    const usersTable = new dynamodb.TableV2(this, 'usersTable', {
      tableName: 'recordsTable',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'user_name',
        type: AttributeType.STRING,
      },
      billing: Billing.onDemand(),
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'expires',
      removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    })

    const usersTable = new dynamodb.TableV2(this, 'usersTable', {
      tableName: 'recordsTable',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'user_name',
        type: AttributeType.STRING,
      },
      billing: Billing.onDemand(),
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'expires',
      removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    })

    const recordsApi = new apigateway.RestApi(this, 'spin-records-api', {
      restApiName: 'spinRecordsApi',
      description: 'Master api for data ingestion, and user endpoints',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowCredentials: true,
      },
    })

    const rawDataHandler = new lambda.Function(this, 'RawRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist'),
      handler: 'rawRecordDataHandler.handler',
      timeout: Duration.seconds(20),
      environment: {
        API_URL: recordsApi.url,
      },
    })

    const publicHandler = new lambda.Function(this, 'PublicRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist'),
      handler: 'PublicRecordDataHandler.handler',
      timeout: Duration.seconds(20),
      environment: {
        API_URL: recordsApi.url,
      },
    })

    const ingestionResource: Resource = recordsApi.root.addResource('raw')
    ingestionResource.addMethod('POST')
    ingestionResource.addResource('{id}').addMethod('GET')
    ingestionResource.addResource('{id}').addMethod('DELETE')
    ingestionResource.addResource('{id}').addMethod('PATCH')

    const clientResource = recordsApi.root.addResource('public')
    clientResource.addMethod('POST')
    clientResource.addResource('{id}').addMethod('GET')
    clientResource.addResource('{id}').addMethod('DELETE')
    clientResource.addResource('{id}').addMethod('PATCH')
  }
}
