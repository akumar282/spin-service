import { RemovalPolicy, SecretValue, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { FargateTask } from './fargate/fargateTask'
import { SESConstruct } from './ses/ses'
import { ComputingNetworkStackProps } from './cdkExtendedProps'
import {
  SubnetType,
  EbsDeviceVolumeType,
  SecurityGroup,
  Port,
} from 'aws-cdk-lib/aws-ec2'
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice'
import { Api } from './apigateway/api'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Compute } from './ec2/ec2'

export class ComputingNetworkingStack extends Stack {
  public api: Api
  public readonly vpc: ec2.Vpc
  public readonly domainEndpoint: string

  public constructor(
    scope: Construct,
    id: string,
    props: ComputingNetworkStackProps
  ) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, 'spinService', {
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

    this.vpc = vpc

    new SESConstruct(this, 'SpinMailer', {
      existingHostedZone: {
        hostedZoneId: props.zone_id,
        zoneName: props.zone_name,
      },
      privateKey: SecretValue.unsafePlainText(props.ses_private_key),
      publicKey: props.ses_public_key,
    })

    const instance = new Compute(this, 'SpinCompute', {
      vpc,
      sshIP: props.ssh_ip,
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

    this.api = recordsApi

    const cluster = new ecs.Cluster(this, 'spinServiceCluster', {
      enableFargateCapacityProviders: true,
      vpc,
    })

    const logGroup = new LogGroup(this, 'DataAggLogGroup', {
      logGroupName: '/ecs/spinServiceContainer',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new FargateTask(
      this,
      'fargateTaskId',
      {
        taskDefId: 'spinServiceTaskId',
        container: {
          id: 'spinServiceContainer',
          assetPath: './image',
        },
        enableDlq: true,
      },
      vpc,
      cluster,
      {
        environment: {
          API_URL: recordsApi.url,
          DISCOGS_TOKEN: props.discogs_token,
          PROXY_IP: props.proxy_ip,
        },
        logs: logGroup,
      }
    )

    const openSearchSecurityGroup = new SecurityGroup(this, 'OSGroup', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'OSAccessGroup',
    })

    openSearchSecurityGroup.addIngressRule(
      instance.SecurityGroup,
      Port.tcp(443),
      'Proxy Access'
    )

    const openSearchLogs = new LogGroup(this, 'IngestionLogGroup', {
      logGroupName: '/aws/vendedlogs/ingestionPipeline',
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.FIVE_DAYS,
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
        masterUserPassword: SecretValue.unsafePlainText(props.opensearch_user),
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
      vpc,
      vpcSubnets: [
        vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_WITH_EGRESS }),
      ],
    })

    this.domainEndpoint = dataIndexingDomain.domainEndpoint
  }
}
