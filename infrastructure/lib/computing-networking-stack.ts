import { RemovalPolicy, SecretValue, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { FargateTask } from './fargate/fargateTask'
import { SESConstruct } from './ses/ses'
import { ComputingNetworkStackProps } from './cdkExtendedProps'
import {
  Instance,
  InstanceSize,
  InstanceType,
  InstanceClass,
  KeyPair,
  SubnetType,
  MachineImage,
  SecurityGroup,
  Peer,
  Port,
} from 'aws-cdk-lib/aws-ec2'

export class ComputingNetworkingStack extends Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: ComputingNetworkStackProps
  ) {
    super(scope, id, props)

    const mailer = new SESConstruct(this, 'SpinMailer', {
      existingHostedZone: {
        hostedZoneId: props.zone_id,
        zoneName: props.zone_name,
      },
      privateKey: SecretValue.unsafePlainText(props.ses_private_key),
      publicKey: props.ses_public_key,
    })

    const cluster = new ecs.Cluster(this, 'spinServiceCluster', {
      enableFargateCapacityProviders: true,
      vpc: props.vpc,
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
      props.vpc,
      cluster,
      {
        environment: {
          API_URL: props.api.url,
          DISCOGS_TOKEN: props.discogs_token,
          PROXY_IP: props.proxy_ip,
        },
        logs: logGroup,
      }
    )

    const instanceSecurityGroup = new SecurityGroup(
      this,
      'SpinComputeSecurityGroup',
      {
        vpc: props.vpc,
        allowAllOutbound: true,
        securityGroupName: 'TunnelAndProxyGroup',
      }
    )

    instanceSecurityGroup.addIngressRule(
      Peer.ipv4(`${props.proxy_ip}/32`),
      Port.tcp(22),
      'SSH Ingress'
    )

    instanceSecurityGroup.addIngressRule(
      Peer.ipv4('0.0.0.0/0'),
      Port.tcp(8080),
      'Gateway Ingress'
    )

    const instance = new Instance(this, 'SpinTunnelProxy', {
      vpc: props.vpc,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
      machineImage: MachineImage.latestAmazonLinux2023(),
      keyPair: KeyPair.fromKeyPairName(this, 'SpinKey', 'spinkey'),
      vpcSubnets: props.vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      securityGroup: instanceSecurityGroup,
    })
  }
}
