import { CfnOutput, Fn, RemovalPolicy, SecretValue, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { FargateTask } from '../fargate/fargateTask'
import { SESConstruct } from '../ses/ses'
import { ComputingNetworkStackProps } from './stackProps'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import {
  EbsDeviceVolumeType,
  SecurityGroup,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2'
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import {
  AnyPrincipal,
  Effect,
  ManagedPolicy,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam'
import { schedulerRole } from '../iam/schedulerRole'

export class ComputingNetworkingStack extends Stack {
  public readonly vpc: ec2.Vpc
  public readonly domainEndpoint: string
  public readonly securityGroup: SecurityGroup

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
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
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
          assetPath: 'images/image/Dockerfile',
        },
        enableDlq: true,
      },
      vpc,
      cluster,
      schedulePerms,
      securityGroup,
      SubnetType.PUBLIC,
      {
        environment: {
          API_URL: apiUrl,
          DISCOGS_TOKEN: props.discogs_token,
          PROXY_IP: props.proxy_ip,
          OPEN_AI_ORG_ID: props.open_ai_org,
          OPEN_AI_KEY: props.open_ai_key,
          PROXY_AUTH_TOKEN: props.proxy_auth_token,
        },
        logs: logGroup,
      }
    )

    new FargateTask(
      this,
      'upcomingReleasesTask',
      {
        taskDefId: 'upcomingReleasesTask',
        container: {
          id: 'upcomingReleaseContainer',
          assetPath: 'images/upcomingReleaseImage/Dockerfile',
        },
        enableDlq: true,
        scheduleExpression: 'rate(12 hours)',
      },
      vpc,
      cluster,
      schedulePerms,
      securityGroup,
      SubnetType.PUBLIC,
      {
        environment: {
          API_URL: apiUrl,
        },
        logs: logGroup,
      }
    )

    new FargateTask(
      this,
      'getOnTask',
      {
        taskDefId: 'getOnTask',
        container: {
          id: 'source2Container',
          assetPath: 'images/image-get-on/Dockerfile',
        },
        enableDlq: true,
        scheduleExpression: 'rate(2 hours)',
      },
      vpc,
      cluster,
      schedulePerms,
      securityGroup,
      SubnetType.PUBLIC,
      {
        environment: {
          API_URL: apiUrl,
        },
        logs: logGroup,
      }
    )

    const bastionSG = new SecurityGroup(this, 'BastionSG', {
      vpc,
      description: 'Security group for bastion host',
      allowAllOutbound: true,
    })

    const openSearchSecurityGroup = new SecurityGroup(this, 'OSGroup', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'OSAccessGroup',
    })

    openSearchSecurityGroup.addIngressRule(securityGroup, ec2.Port.tcp(443))

    openSearchSecurityGroup.addIngressRule(
      bastionSG,
      ec2.Port.tcp(443),
      'Allow bastion access to OpenSearch'
    )

    const endpointSG = new ec2.SecurityGroup(this, 'EndpointSG', {
      vpc,
      allowAllOutbound: true,
    })

    endpointSG.addIngressRule(
      securityGroup,
      ec2.Port.tcp(443),
      'Allow ECS to reach VPC endpoints'
    )

    endpointSG.addEgressRule(
      securityGroup,
      ec2.Port.tcp(443),
      'Allow response traffic back to ECS'
    )

    vpc.addGatewayEndpoint('DynamoDbEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
    })

    vpc.addInterfaceEndpoint('SQSEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SQS,
      privateDnsEnabled: true,
      securityGroups: [endpointSG],
    })

    this.securityGroup = securityGroup

    const bastion = new ec2.Instance(this, 'BastionHost', {
      vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: bastionSG,
    })

    bastion.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    )

    const openSearchLogs = new LogGroup(this, 'IngestionLogGroup', {
      logGroupName: '/aws/vendedlogs/ingestionPipeline',
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.FIVE_DAYS,
    })

    const dataIndexingDomain = new Domain(this, 'SpinDataDomain', {
      version: EngineVersion.OPENSEARCH_2_17,
      domainName: 'spin-data-vpc',
      vpc,
      vpcSubnets: [
        {
          subnets: [vpc.isolatedSubnets[0]],
        },
      ],
      logging: {
        appLogGroup: openSearchLogs,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      fineGrainedAccessControl: {
        masterUserName: props.opensearch_user,
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

    new CfnOutput(this, 'BastionInstanceId', {
      value: bastion.instanceId,
    })
  }
}
