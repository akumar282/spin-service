import * as cdk from 'aws-cdk-lib'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import {
  AttributeType,
  Billing,
  ProjectionType,
  StreamViewType,
} from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Resource } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { FargateTask } from './fargate/fargateTask'
import { FargateScheduleProps } from './fargate/types'
import { getEnv } from './shared/utils'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { pipelineConfig } from './opensearch/pipelineConfig'
import { pipelineRole } from './opensearch/pipelineRoles'
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam'
import { OpenSearchIngestion } from './opensearch/ingestion'
import { openSearchPipeline } from './opensearch/pipeline'

export class SpinServiceStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const logGroup = new LogGroup(this, 'DataAggLogGroup', {
      logGroupName: '/ecs/spinServiceContainer',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const recordsTable = new dynamodb.TableV2(this, 'recordsTableNew', {
      tableName: 'recordsTableNew',
      tags: [{ key: 'SpinServiceRecords', value: 'SpinServiceRecords' }],
      partitionKey: {
        name: 'postId',
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
      dynamoStream: StreamViewType.NEW_IMAGE,
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
      indexName: 'idIndex',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    })

    const usersTable = new dynamodb.TableV2(this, 'usersTable', {
      tableName: 'usersTable',
      tags: [{ key: 'SpinServiceUsers', value: 'SpinServiceUsers' }],
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
      dynamoStream: StreamViewType.NEW_IMAGE,
    })

    const openSearchLogs = new LogGroup(this, 'IngestionLogGroup', {
      logGroupName: '/aws/vendedlogs/ingestionPipeline',
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.FIVE_DAYS,
    })

    const s3SearchBucket = new Bucket(this, 'OpenSearchBucket', {
      bucketName: 'open-search-bucket-1738',
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const pipeRole = pipelineRole(this)

    pipeRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
    )

    pipeRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
    )

    const ingestionOpenSearchResource = new OpenSearchIngestion(
      this,
      'IndexAbility',
      {
        collectionName: 'ingestion',
        pipelineRoleArn: pipeRole.roleArn,
      }
    )

    const recordsPipeConfig = pipelineConfig(
      recordsTable,
      s3SearchBucket.bucketName,
      pipeRole.roleArn,
      ingestionOpenSearchResource.getEndpoint(),
      ingestionOpenSearchResource.getNetworkName(),
      'records'
    )

    const usersPipeConfig = pipelineConfig(
      usersTable,
      s3SearchBucket.bucketName,
      pipeRole.roleArn,
      ingestionOpenSearchResource.getEndpoint(),
      ingestionOpenSearchResource.getNetworkName(),
      'users'
    )

    openSearchPipeline(
      this,
      recordsPipeConfig,
      openSearchLogs.logGroupName,
      'records-opensearchpipelinev2',
      'recordsPipelineConstructV2'
    )

    openSearchPipeline(
      this,
      usersPipeConfig,
      openSearchLogs.logGroupName,
      'users-opensearchpipelinev2',
      'usersPipelineConstructV2'
    )

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
        PROXY_IP: getEnv('PROXY_IP'),
      },
      logs: logGroup,
    })

    const rawDataHandler = new lambda.Function(this, 'RawRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/rawDataIngestion'),
      handler: 'index.handler',
      timeout: Duration.seconds(20),
      environment: {
        TABLE_NAME: recordsTable.tableName,
        TABLE_ARN: recordsTable.tableArn,
      },
    })

    const publicHandler = new lambda.Function(this, 'PublicRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/publicRecordDataHandler'),
      handler: 'index.handler',
      timeout: Duration.seconds(20),
      environment: {
        TABLE_NAME: recordsTable.tableName,
        TABLE_ARN: recordsTable.tableArn,
        USER_TABLE: usersTable.tableName,
      },
    })

    recordsTable.grantReadWriteData(rawDataHandler)
    recordsTable.grantReadWriteData(publicHandler)

    const rawDataIntegration = new apigateway.LambdaIntegration(rawDataHandler)
    const publicDataIntegration = new apigateway.LambdaIntegration(
      publicHandler
    )

    const ingestionResource: Resource = recordsApi.root.addResource('raw')
    ingestionResource.addMethod('POST', rawDataIntegration)
    const ingestionResourceId = ingestionResource.addResource('{id}')
    ingestionResourceId.addMethod('GET', rawDataIntegration)
    ingestionResourceId.addMethod('DELETE', rawDataIntegration)
    ingestionResourceId.addMethod('PATCH', rawDataIntegration)

    const clientResource = recordsApi.root.addResource('public')
    clientResource.addMethod('POST', publicDataIntegration)
    clientResource.addResource('{id}').addMethod('GET', publicDataIntegration)

    new cdk.CfnOutput(this, 'OpenSearchServerlessCollectionEndpoint', {
      value: `${ingestionOpenSearchResource.getEndpoint()}`,
    })
  }
}
