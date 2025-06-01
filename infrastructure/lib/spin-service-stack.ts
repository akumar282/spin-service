import * as cdk from 'aws-cdk-lib'
import {
  aws_cognito as cognito,
  aws_pipes as pipes,
  aws_sqs as sqs,
  Duration,
  RemovalPolicy,
  SecretValue,
} from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import {
  AttributeType,
  Billing,
  ProjectionType,
  StreamViewType,
} from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { FargateTask } from './fargate/fargateTask'
import { FargateScheduleProps } from './fargate/types'
import { getEnv } from './shared/utils'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice'
import { queueRole } from './iam/queueRole'
import { CfnPipeProps } from 'aws-cdk-lib/aws-pipes'
import { EbsDeviceVolumeType } from 'aws-cdk-lib/aws-ec2'
import {
  DynamoEventSource,
  SqsEventSource,
} from 'aws-cdk-lib/aws-lambda-event-sources'
import { Api } from './apigateway/api'
import { SESConstruct } from './ses/ses'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'

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

    const ledgerTable = new dynamodb.TableV2(this, 'ledgerTable', {
      tableName: 'ledgerTable',
      partitionKey: {
        name: 'postId',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'expires',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const userPool = new cognito.UserPool(this, 'SpinUsers', {
      userPoolName: 'SpinUsers',
      signInAliases: {
        email: true,
        phone: true,
        username: false,
      },
      autoVerify: {
        email: false,
        phone: false,
      },
      accountRecovery: cognito.AccountRecovery.NONE,
      selfSignUpEnabled: true,
    })

    const userPoolClient = userPool.addClient('SpinClient', {
      userPoolClientName: 'WebAuthClient',
      authFlows: {
        userPassword: true,
      },
      generateSecret: false,
      idTokenValidity: Duration.hours(2),
    })

    const userPoolClientMobile = userPool.addClient('SpinClientMobile', {
      userPoolClientName: 'MobileAuthClient',
      authFlows: {
        userPassword: true,
      },
      generateSecret: false,
      idTokenValidity: Duration.hours(8),
      refreshTokenValidity: Duration.days(365),
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

    const dataIndexingDomain = new Domain(this, 'SpinDataDomain', {
      version: EngineVersion.OPENSEARCH_2_17,
      domainName: 'spin-data',
      logging: {
        appLogGroup: openSearchLogs,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      fineGrainedAccessControl: {
        masterUserName: 'admin',
        masterUserPassword: SecretValue.unsafePlainText(getEnv('DASHPASS')),
      },
      capacity: {
        dataNodeInstanceType: 't3.small.search',
        dataNodes: 1,
        multiAzWithStandbyEnabled: false,
      },
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true,
      },
      ebs: {
        volumeType: EbsDeviceVolumeType.GP3,
        volumeSize: 15,
      },
      enforceHttps: true,
      enableAutoSoftwareUpdate: true,
    })

    const mailer = new SESConstruct(this, 'SpinMailer', {
      existingHostedZone: {
        hostedZoneId: getEnv('ZONE_ID'),
        zoneName: getEnv('ZONE_NAME'),
      },
      privateKey: SecretValue.unsafePlainText(getEnv('SES_PRIVATE_KEY')),
      publicKey: getEnv('SES_PUBLIC_KEY'),
    })

    const recordsApi = new Api(this, {
      id: 'spin-records-api',
      props: {
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
        API_URL: recordsApi.api.url,
        DISCOGS_TOKEN: getEnv('DISCOGS_TOKEN'),
        PROXY_IP: getEnv('PROXY_IP'),
      },
      logs: logGroup,
    })

    const pipelogGroup = new LogGroup(this, 'PipeLogGroup', {
      logGroupName: '/pipes/dynamoToSqs',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const processingQueue = new sqs.Queue(this, 'processing_queue', {
      retentionPeriod: Duration.days(14),
    })
    const processingRole = queueRole(this)

    const processingPipeline = new pipes.CfnPipe(this, 'processing-pipe', <
      CfnPipeProps
    >{
      roleArn: processingRole.roleArn,
      source: recordsTable.tableStreamArn,
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: 'LATEST',
          batchSize: 10,
        },
        filterCriteria: {
          filters: [
            {
              pattern: '{"eventName":["INSERT"]}',
            },
          ],
        },
      },
      target: processingQueue.queueArn,
      logConfiguration: {
        cloudwatchLogsLogDestination: {
          logGroupArn: pipelogGroup.logGroupArn,
        },
        level: 'TRACE',
      },
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
        USER_TABLE: usersTable.tableName,
      },
    })

    const streamLambda = new lambda.Function(this, 'streamLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/streamLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(20),
      environment: {
        OPEN_SEARCH_ENDPOINT: dataIndexingDomain.domainEndpoint,
        DASHPASS: getEnv('DASHPASS'),
        USER: getEnv('USER'),
        TABLE_NAME: recordsTable.tableName,
        USERS_TABLE: usersTable.tableName,
      },
    })

    const processinglambda = new lambda.Function(this, 'processingLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/processingLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(20),
      environment: {
        OPEN_SEARCH_ENDPOINT: dataIndexingDomain.domainEndpoint,
        SQS_URL: processingQueue.queueUrl,
        LEDGER_TABLE: ledgerTable.tableName,
      },
    })

    const authLambda = new lambda.Function(this, 'authLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/authLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      environment: {
        WEB_CLIENT_ID: userPoolClient.userPoolClientId,
        WEB_CLIENT_NAME: userPoolClient.userPoolClientName,
        MOBILE_CLIENT_ID: userPoolClientMobile.userPoolClientId,
        MOBILE_CLIENT_NAME: userPoolClientMobile.userPoolClientName,
        USER_POOL_ID: userPool.userPoolId,
        TABLE_NAME: usersTable.tableName,
        USER_TABLE_ARN: usersTable.tableArn,
      },
    })

    const refreshLambda = new lambda.Function(this, 'refreshLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/refreshLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      environment: {
        WEB_CLIENT_ID: userPoolClient.userPoolClientId,
        WEB_CLIENT_NAME: userPoolClient.userPoolClientName,
        MOBILE_CLIENT_ID: userPoolClientMobile.userPoolClientId,
        MOBILE_CLIENT_NAME: userPoolClientMobile.userPoolClientName,
      },
    })

    const userLambda = new lambda.Function(this, 'UserLambda', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset('dist/userLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: usersTable.tableName,
      },
    })

    s3SearchBucket.grantReadWrite(streamLambda)
    recordsTable.grantReadWriteData(streamLambda)
    recordsTable.grantStreamRead(streamLambda)
    usersTable.grantReadWriteData(streamLambda)
    usersTable.grantReadWriteData(userLambda)
    usersTable.grantStreamRead(streamLambda)

    recordsTable.grantReadWriteData(rawDataHandler)
    recordsTable.grantReadWriteData(publicHandler)
    usersTable.grantReadWriteData(authLambda)
    authLambda.addToRolePolicy(
      new PolicyStatement({
        sid: 'AdminApproveUser',
        effect: Effect.ALLOW,
        actions: ['cognito-idp:AdminConfirmSignUp'],
        resources: ['*'],
      })
    )

    streamLambda.addEventSource(
      new DynamoEventSource(recordsTable, {
        startingPosition: StartingPosition.LATEST,
      })
    )

    streamLambda.addEventSource(
      new DynamoEventSource(usersTable, {
        startingPosition: StartingPosition.LATEST,
      })
    )

    processinglambda.addEventSource(
      new SqsEventSource(processingQueue, {
        batchSize: 50,
        maxBatchingWindow: Duration.minutes(1),
        maxConcurrency: 10,
      })
    )

    const authIntegration = new apigateway.LambdaIntegration(authLambda)
    const userIntegration = new apigateway.LambdaIntegration(userLambda)
    const refreshIntegration = new apigateway.LambdaIntegration(refreshLambda)
    const rawDataIntegration = new apigateway.LambdaIntegration(rawDataHandler)
    const publicDataIntegration = new apigateway.LambdaIntegration(
      publicHandler
    )

    recordsApi.addResources([
      {
        pathPart: 'raw',
        methods: [
          {
            method: 'POST',
            integration: rawDataIntegration,
          },
        ],
        resources: [
          {
            pathPart: '{id}',
            methods: [
              {
                method: 'GET',
                integration: rawDataIntegration,
              },
              {
                method: 'DELETE',
                integration: rawDataIntegration,
              },
              {
                method: 'PATCH',
                integration: rawDataIntegration,
              },
            ],
          },
        ],
      },
      {
        pathPart: 'public',
        methods: [
          {
            method: 'POST',
            integration: publicDataIntegration,
          },
        ],
        resources: [
          {
            pathPart: '{id}',
            methods: [
              {
                method: 'GET',
                integration: publicDataIntegration,
              },
            ],
          },
          {
            pathPart: 'auth',
            methods: [
              {
                method: 'POST',
                integration: authIntegration,
              },
            ],
          },
          {
            pathPart: 'refresh',
            methods: [
              {
                method: 'POST',
                integration: refreshIntegration,
              },
            ],
          },
          {
            pathPart: 'user',
            methods: [
              {
                method: 'POST',
                integration: userIntegration,
              },
            ],
            resources: [
              {
                pathPart: '{id}',
                methods: [
                  {
                    method: 'GET',
                    integration: userIntegration,
                  },
                ],
              },
            ],
          },
        ],
      },
    ])

    new cdk.CfnOutput(this, 'OpenSearchEndpoint', {
      value: `https://${dataIndexingDomain.domainEndpoint}/`,
    })

    new cdk.CfnOutput(this, 'PipeArn', {
      value: processingPipeline.attrArn,
    })
  }
}
