import { RemovalPolicy, SecretValue, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { FargateTask } from './fargate/fargateTask'
import { SESConstruct } from './ses/ses'
import { ComputingNetworkStackProps } from './cdkExtendedProps'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import {
  EbsDeviceVolumeType,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  KeyPair,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2'
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice'
import { Api } from './apigateway/api'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'
import * as path from 'node:path'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import {
  AnyPrincipal,
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'

export class ComputingNetworkingStack extends Stack {
  public api: Api
  public readonly vpc: ec2.Vpc
  public readonly domainEndpoint: string
  public readonly instanceIp: string

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

    const asset = new Asset(this, 'Ec2SpinProxyAsset', {
      path: path.join(__dirname, '../../ec2-proxy'),
    })

    new SESConstruct(this, 'SpinMailer', {
      existingHostedZone: {
        hostedZoneId: props.zone_id,
        zoneName: props.zone_name,
      },
      privateKey: SecretValue.unsafePlainText(props.ses_private_key),
      publicKey: props.ses_public_key,
    })

    const instanceSecurityGroup = new SecurityGroup(
      this,
      'SpinComputeSecurityGroup',
      {
        vpc,
        allowAllOutbound: true,
        securityGroupName: 'TunnelAndProxyGroup',
      }
    )

    instanceSecurityGroup.addIngressRule(
      Peer.ipv4(`${props.ssh_ip}/32`),
      Port.tcp(22),
      'SSH Ingress'
    )

    instanceSecurityGroup.addIngressRule(
      Peer.ipv4('0.0.0.0/0'),
      Port.tcp(8080),
      'Gateway Ingress'
    )

    const instance = new Instance(this, 'SpinMachine', {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
      machineImage: MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      keyPair: KeyPair.fromKeyPairName(this, 'SpinKey', 'spinkey'),
      vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      securityGroup: instanceSecurityGroup,
      allowAllOutbound: true,
    })

    this.instanceIp = instance.instancePublicIp

    const logRole = new Role(this, 'ApiGwLogsRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonAPIGatewayPushToCloudWatchLogs'
        ),
      ],
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

    recordsApi.addLogging(logRole.roleArn)

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
      instanceSecurityGroup,
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
      vpc,
      vpcSubnets: [
        {
          subnets: [
            vpc.selectSubnets({
              subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            }).subnets[0],
          ],
        },
      ],
    })

    const accessPolicy = new PolicyStatement({
      sid: 'AllowAccessTunnel',
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ['es:ESHttp*'],
      resources: [`${dataIndexingDomain.domainArn}/*`],
    })

    dataIndexingDomain.addAccessPolicies(accessPolicy)

    new StringParameter(this, 'OpenSearchEndpoint', {
      parameterName: '/os/endpoint',
      stringValue: `${recordsApi.url}os/`,
    })

    this.domainEndpoint = dataIndexingDomain.domainEndpoint

    instance.userData.addCommands(
      'sudo yum update -y',
      'sudo yum install -y nodejs',
      'sudo apt-get install make',
      'node -e "console.log(\'Running Node.js \' + process.version)"',
      `aws s3 cp ${asset.s3ObjectUrl} /tmp/ec2-proxy.zip`,
      'unzip /tmp/ec2-proxy.zip -d /home/ec2-user/ec2-proxy',
      'cd /home/ec2-user/ec2-proxy',
      'sudo yum install -y make',
      'sudo npm install -g esbuild',
      'sudo npm install',
      `sudo export ENDPOINT=https://${dataIndexingDomain.domainEndpoint} make buildDeploy`
    )

    asset.grantRead(instance)
  }
}
