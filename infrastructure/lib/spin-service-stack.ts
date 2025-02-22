import * as cdk from 'aws-cdk-lib'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import {
  AttributeType,
  Billing,
  ProjectionType,
} from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Resource } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { FargateTask } from './fargate/fargateTask'
import { FargateScheduleProps } from './fargate/types'
import { getEnv } from './shared/utils'
import { LogGroup } from 'aws-cdk-lib/aws-logs'

export class SpinServiceStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const logGroup = new LogGroup(this, 'DataAggLogGroup', {
      logGroupName: '/ecs/spinServiceContainer',
      removalPolicy: RemovalPolicy.DESTROY,
    })

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
      removalPolicy: RemovalPolicy.DESTROY,
    })

    recordsTable.addGlobalSecondaryIndex({
      indexName: 'album',
      partitionKey: {
        name: 'albumTitle',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    recordsTable.addGlobalSecondaryIndex({
      indexName: 'rawPostId',
      partitionKey: {
        name: 'postId',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
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

    const spinScraperProps: FargateScheduleProps = {
      taskDefId: 'spinServiceTaskId',
      vpcId: 'spinService',
      clusterId: 'spinServiceCluster',
      container: {
        id: 'spinServiceContainer',
        assetPath: './image',
      },
      enableDlq: true,
    }

    new FargateTask(this, 'fargateTaskId', spinScraperProps, {
      environment: {
        API_URL: recordsApi.url,
        DISCOGS_TOKEN: getEnv('DISCOGS_TOKEN'),
      },
      logs: logGroup,
    })

    const rawDataHandler = new lambda.Function(this, 'RawRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/rawDataIngestion'),
      handler: 'rawRecordDataHandler.handler',
      timeout: Duration.seconds(20),
      environment: {
        API_URL: recordsApi.url,
        TABLE_NAME: recordsTable.tableName,
        TABLE_ARN: recordsTable.tableArn,
      },
    })

    const publicHandler = new lambda.Function(this, 'PublicRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/publicRecordDataHandler'),
      handler: 'publicRecordDataHandler.handler',
      timeout: Duration.seconds(20),
      environment: {
        API_URL: recordsApi.url,
        TABLE_NAME: recordsTable.tableName,
        TABLE_ARN: recordsTable.tableArn,
        USER_TABLE: usersTable.tableName,
      },
    })

    const rawDataIntegration = new apigateway.LambdaIntegration(rawDataHandler)
    const publicDataIntegration = new apigateway.LambdaIntegration(
      publicHandler
    )

    const ingestionResource: Resource = recordsApi.root.addResource('raw')
    ingestionResource.addMethod('POST', rawDataIntegration)
    ingestionResource.addResource('{id}').addMethod('GET', rawDataIntegration)
    ingestionResource
      .addResource('{id}')
      .addMethod('DELETE', rawDataIntegration)
    ingestionResource.addResource('{id}').addMethod('PATCH', rawDataIntegration)

    const clientResource = recordsApi.root.addResource('public')
    clientResource.addMethod('POST', publicDataIntegration)
    clientResource.addResource('{id}').addMethod('GET', publicDataIntegration)
  }
}
