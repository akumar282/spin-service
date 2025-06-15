import {
  aws_cognito as cognito,
  aws_pipes as pipes,
  aws_sqs as sqs,
  Duration,
  RemovalPolicy,
  Stack,
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
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { queueRole } from './iam/queueRole'
import { CfnPipeProps } from 'aws-cdk-lib/aws-pipes'
import {
  DynamoEventSource,
  SqsEventSource,
} from 'aws-cdk-lib/aws-lambda-event-sources'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { CdkExtendedProps } from './cdkExtendedProps'

export class SpinServiceStack extends Stack {
  public constructor(scope: Construct, id: string, props: CdkExtendedProps) {
    super(scope, id, props)

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

    const s3SearchBucket = new Bucket(this, 'OpenSearchBucket', {
      bucketName: 'open-search-bucket-1738',
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const pipelogGroup = new LogGroup(this, 'PipeLogGroup', {
      logGroupName: '/pipes/dynamoToSqs',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const processingQueue = new sqs.Queue(this, 'processing_queue', {
      retentionPeriod: Duration.days(14),
    })
    const processingRole = queueRole(this)

    new pipes.CfnPipe(this, 'processing-pipe', <CfnPipeProps>{
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
        DASHPASS: props.dashpass,
        USER: props.opensearch_user,
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

    recordsTable.grantReadWriteData(streamLambda)
    recordsTable.grantStreamRead(streamLambda)
    usersTable.grantReadWriteData(streamLambda)
    usersTable.grantStreamRead(streamLambda)
    usersTable.grantReadWriteData(userLambda)
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

    const proxyDataIntegration = new apigateway.HttpIntegration(
      `http://${props.instanceIp}:8080`
    )

    props.api.addResources([
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
      {
        pathPart: 'os',
        methods: [
          {
            method: 'ANY',
          },
        ],
        resources: [
          {
            pathPart: '{proxy+}',
            methods: [
              {
                method: 'ANY',
                integration: proxyDataIntegration,
              },
            ],
          },
        ],
      },
    ])
  }
}
