import { Fn, RemovalPolicy, SecretValue, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { FargateTask } from './fargate/fargateTask'
import { SESConstruct } from './ses/ses'
import { ComputingNetworkStackProps } from './cdkExtendedProps'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { EbsDeviceVolumeType, SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { schedulerRole } from './iam/schedulerRole'

export class ComputingNetworkingStack extends Stack {
  public readonly vpc: ec2.Vpc
  public readonly domainEndpoint: string

  public constructor(
    scope: Construct,
    id: string,
    props: ComputingNetworkStackProps
  ) {
    super(scope, id, props)

    const vpc = new ec2.Vpc(this, 'spinService', {
      enableDnsHostnames: true,
      enableDnsSupport: true,
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

    const cluster = new ecs.Cluster(this, 'spinServiceCluster', {
      enableFargateCapacityProviders: true,
      vpc,
    })

    const logGroup = new LogGroup(this, 'DataAggLogGroup', {
      logGroupName: '/ecs/spinServiceContainer',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const schedulePerms = schedulerRole(this)

    const securityGroup = new ec2.SecurityGroup(this, 'SpinTaskSecGroup', {
      vpc,
      allowAllOutbound: true,
    })

    const apiUrl = Fn.importValue('SpinApiUrl')

    new FargateTask(
      this,
      'discogsTask',
      {
        taskDefId: 'spinServiceTaskDiscogs',
        container: {
          id: 'spinServiceContainer',
          assetPath: './image',
        },
        enableDlq: true,
      },
      vpc,
      cluster,
      schedulePerms,
      securityGroup,
      {
        environment: {
          API_URL: apiUrl,
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
        masterUserPassword: SecretValue.unsafePlainText(props.dashpass),
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
      securityGroups: [openSearchSecurityGroup],
      enableAutoSoftwareUpdate: true,
    })

    const accessPolicy = new PolicyStatement({
      sid: 'AllowAccessTunnel',
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ['es:ESHttp*'],
      resources: [`${dataIndexingDomain.domainArn}/*`],
    })

    dataIndexingDomain.addAccessPolicies(accessPolicy)

    this.domainEndpoint = dataIndexingDomain.domainEndpoint

    new StringParameter(this, 'OpenSearchEndpoint', {
      parameterName: '/os/endpoint',
      stringValue: `https://${dataIndexingDomain.domainEndpoint}/`,
    })
  }
}
