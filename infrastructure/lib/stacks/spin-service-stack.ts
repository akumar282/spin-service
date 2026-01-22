import {
  aws_cognito as cognito,
  aws_pipes as pipes,
  aws_sqs as sqs,
  CfnOutput,
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
import { queueRole } from '../iam/queueRole'
import { CfnPipeProps } from 'aws-cdk-lib/aws-pipes'
import {
  DynamoEventSource,
  SqsEventSource,
} from 'aws-cdk-lib/aws-lambda-event-sources'
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { SpinStackProps } from './stackProps'
import { Api } from '../apigateway/api'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { gatewayRole } from '../iam/gatewayRole'

export class SpinServiceStack extends Stack {
  public constructor(scope: Construct, id: string, props: SpinStackProps) {
    super(scope, id, props)

    const logRole = new Role(this, 'ApiGwLogsRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonAPIGatewayPushToCloudWatchLogs'
        ),
      ],
    })

    const allowedDomain = StringParameter.valueForStringParameter(
      this,
      '/domain/endpoint'
    )

    const recordsApi = new Api(this, {
      id: 'spin-records-api',
      props: {
        restApiName: 'spinRecordsApi',
        description: 'Master api for data ingestion, and user endpoints',
        defaultCorsPreflightOptions: {
          allowOrigins: [
            'http://localhost:5173',
            'https://localhost:5173',
            'http://localhost:8080',
            'https://localhost:8080',
            'https://spinmyrecords.com',
            'https://www.spinmyrecords.com',
            'https://dev.spinmyrecords.com',
            allowedDomain,
          ],
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

    recordsApi.addLogging(logRole.roleArn)

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
      indexName: 'dateGroup',
      partitionKey: {
        name: 'dateGroup',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'created_time',
        type: AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
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

    const upcomingTable = new dynamodb.TableV2(this, 'upcomingTable', {
      tableName: 'upcomingTable',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'expires',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    upcomingTable.addGlobalSecondaryIndex({
      indexName: 'album',
      partitionKey: {
        name: 'albumTitle',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
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
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
        version: new cognito.NumberAttribute({ mutable: true }),
      },
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

    new StringParameter(this, 'OpenSearchEndpoint', {
      parameterName: '/machineKey',
      stringValue: 'poopyMcButts',
    })

    const rawDataHandler = new lambda.Function(this, 'RawRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/rawDataIngestion'),
      handler: 'index.handler',
      timeout: Duration.seconds(20),
      environment: {
        TABLE_NAME: recordsTable.tableName,
        TABLE_ARN: recordsTable.tableArn,
        UPCOMING_TABLE: upcomingTable.tableName,
      },
    })

    const publicHandler = new lambda.Function(this, 'PublicRecordDataHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/publicRecordDataHandler'),
      handler: 'index.handler',
      timeout: Duration.seconds(20),
      environment: {
        TABLE_NAME: recordsTable.tableName,
        USER_TABLE: usersTable.tableName,
        UPCOMING_TABLE: upcomingTable.tableName,
        CLOUD_DISTRO: allowedDomain,
      },
    })

    const streamLambda = new lambda.Function(this, 'StreamLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
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

    const processinglambda = new lambda.Function(this, 'ProcessingLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/processingLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(20),
      environment: {
        SQS_URL: processingQueue.queueUrl,
        LEDGER_TABLE: ledgerTable.tableName,
        DASHPASS: props.dashpass,
        USER: props.opensearch_user,
      },
    })

    const authLambda = new lambda.Function(this, 'AuthLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
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
        CLOUD_DISTRO: allowedDomain,
      },
    })

    const refreshLambda = new lambda.Function(this, 'RefreshLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/refreshLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      environment: {
        WEB_CLIENT_ID: userPoolClient.userPoolClientId,
        WEB_CLIENT_NAME: userPoolClient.userPoolClientName,
        MOBILE_CLIENT_ID: userPoolClientMobile.userPoolClientId,
        MOBILE_CLIENT_NAME: userPoolClientMobile.userPoolClientName,
        CLOUD_DISTRO: allowedDomain,
      },
    })

    const userLambda = new lambda.Function(this, 'UserLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/userLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: usersTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        CLOUD_DISTRO: allowedDomain,
      },
    })

    const searchProxyLambda = new lambda.Function(this, 'searchProxyLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/searchProxyLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      environment: {
        DISCOGS_CONSUMER_KEY: props.discogs_key,
        DISCOGS_SECRET: props.discogs_secret,
        CLOUD_DISTRO: allowedDomain,
      },
    })

    const sessionLambda = new lambda.Function(this, 'sessionLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/sessionLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      environment: {
        WEB_CLIENT_ID: userPoolClient.userPoolClientId,
        MOBILE_CLIENT_ID: userPoolClientMobile.userPoolClientId,
        USER_POOL_ID: userPool.userPoolId,
        CLOUD_DISTRO: allowedDomain,
      },
    })

    const publicAuthorizerLambda = new lambda.Function(
      this,
      'authorizerLambda',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('dist/authorizerLambda'),
        handler: 'index.handler',
        timeout: Duration.seconds(10),
        environment: {
          WEB_CLIENT_ID: userPoolClient.userPoolClientId,
          WEB_CLIENT_NAME: userPoolClient.userPoolClientName,
          MOBILE_CLIENT_ID: userPoolClientMobile.userPoolClientId,
          MOBILE_CLIENT_NAME: userPoolClientMobile.userPoolClientName,
          USER_POOL_ID: userPool.userPoolId,
          USER_TABLE_ARN: usersTable.tableArn,
          CLOUD_DISTRO: allowedDomain,
        },
      }
    )

    const postSignUpLambda = new lambda.Function(this, 'postSignUpLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('dist/postSignUpLambda'),
      handler: 'index.handler',
      timeout: Duration.seconds(10),
    })

    userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postSignUpLambda
    )

    // const robotAuthorizerLambda = new lambda.Function(
    //   this,
    //   'fargateAuthorizerLambda',
    //   {
    //     runtime: lambda.Runtime.NODEJS_20_X,
    //     code: lambda.Code.fromAsset('dist/fargateAuthorizerLambda'),
    //     handler: 'index.handler',
    //     timeout: Duration.seconds(10),
    //   }
    // )

    recordsTable.grantReadWriteData(streamLambda)
    recordsTable.grantStreamRead(streamLambda)
    usersTable.grantReadWriteData(streamLambda)
    usersTable.grantStreamRead(streamLambda)
    usersTable.grantReadWriteData(userLambda)
    usersTable.grantReadData(publicAuthorizerLambda)
    recordsTable.grantReadWriteData(rawDataHandler)
    recordsTable.grantReadWriteData(publicHandler)
    usersTable.grantReadWriteData(authLambda)
    ledgerTable.grantReadWriteData(processinglambda)
    recordsTable.grantStreamRead(processinglambda)
    upcomingTable.grantReadWriteData(publicHandler)
    upcomingTable.grantReadWriteData(rawDataHandler)

    const ssmPolicy = new PolicyStatement({
      sid: 'SSMGetParam',
      effect: Effect.ALLOW,
      actions: ['ssm:GetParameter'],
      resources: ['*'],
    })

    processinglambda.addToRolePolicy(
      new PolicyStatement({
        sid: 'SESOptions',
        effect: Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    )

    postSignUpLambda.addToRolePolicy(
      new PolicyStatement({
        sid: 'SESOptions',
        effect: Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    )

    authLambda.addToRolePolicy(
      new PolicyStatement({
        sid: 'AdminApproveUser',
        effect: Effect.ALLOW,
        actions: ['cognito-idp:AdminConfirmSignUp'],
        resources: ['*'],
      })
    )

    userLambda.addToRolePolicy(
      new PolicyStatement({
        sid: 'AdminUpdateUser',
        effect: Effect.ALLOW,
        actions: ['cognito-idp:AdminUpdateUserAttributes'],
        resources: ['*'],
      })
    )

    streamLambda.addToRolePolicy(ssmPolicy)
    processinglambda.addToRolePolicy(ssmPolicy)

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
        reportBatchItemFailures: true,
      })
    )

    const authIntegration = new apigateway.LambdaIntegration(authLambda)
    const sessionIntegration = new apigateway.LambdaIntegration(sessionLambda)
    const userIntegration = new apigateway.LambdaIntegration(userLambda)
    const refreshIntegration = new apigateway.LambdaIntegration(refreshLambda)
    const rawDataIntegration = new apigateway.LambdaIntegration(rawDataHandler)
    const searchProxyIntegration = new apigateway.LambdaIntegration(
      searchProxyLambda
    )
    const publicDataIntegration = new apigateway.LambdaIntegration(
      publicHandler
    )

    const publicAuthorizer = new apigateway.RequestAuthorizer(
      this,
      'PublicAuthorizer',
      {
        identitySources: [
          apigateway.IdentitySource.header('Cookie'),
          apigateway.IdentitySource.header('Authorization'),
        ],
        handler: publicAuthorizerLambda,
        resultsCacheTtl: Duration.hours(1),
        assumeRole: gatewayRole(this),
      }
    )

    // const privateAuthorizer = new apigateway.TokenAuthorizer(
    //   this,
    //   'PrivateTokenAuthorizer',
    //   {
    //     handler: robotAuthorizerLambda,
    //     resultsCacheTtl: Duration.hours(1),
    //   }
    // )

    recordsApi.addResources([
      {
        pathPart: 'raw',
        methods: [
          {
            method: 'POST',
            integration: rawDataIntegration,
            // options: {
            //   authorizer: privateAuthorizer,
            // },
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
          {
            pathPart: 'upcoming',
            methods: [
              {
                method: 'POST',
                integration: rawDataIntegration,
                // options: {
                //   authorizer: privateAuthorizer,
                // },
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
            options: {
              authorizer: publicAuthorizer,
            },
          },
          {
            method: 'GET',
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
            pathPart: 'session',
            methods: [
              {
                method: 'GET',
                integration: sessionIntegration,
              },
            ],
            resources: [
              {
                pathPart: 'logout',
                methods: [
                  {
                    method: 'GET',
                    integration: sessionIntegration,
                  },
                ],
              },
            ],
          },
          {
            pathPart: 'refresh',
            methods: [
              {
                method: 'POST',
                integration: refreshIntegration,
                options: {
                  authorizer: publicAuthorizer,
                },
              },
            ],
          },
          {
            pathPart: 'guest',
            methods: [
              {
                method: 'GET',
                integration: publicDataIntegration,
              },
            ],
          },
          {
            pathPart: 'upcoming',
            methods: [
              {
                method: 'GET',
                integration: publicDataIntegration,
              },
            ],
          },
          {
            pathPart: 'user',
            methods: [
              {
                method: 'POST',
                integration: userIntegration,
                // options: {
                //   authorizer: publicAuthorizer,
                // },
              },
            ],
            resources: [
              {
                pathPart: '{id}',
                methods: [
                  {
                    method: 'GET',
                    integration: userIntegration,
                    options: {
                      authorizer: publicAuthorizer,
                    },
                  },
                  {
                    method: 'PATCH',
                    integration: userIntegration,
                    options: {
                      authorizer: publicAuthorizer,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        pathPart: 'search',
        resources: [
          {
            pathPart: '{proxy+}',
            methods: [
              {
                method: 'GET',
                integration: searchProxyIntegration,
              },
            ],
          },
        ],
      },
    ])

    new CfnOutput(this, 'ApiUrl', {
      value: recordsApi.url,
      exportName: 'SpinApiUrl',
    })
  }
}
