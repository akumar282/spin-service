import { Construct } from 'constructs'
import {
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
  Vpc,
} from 'aws-cdk-lib/aws-ec2'

export interface ComputeProps {
  vpc: Vpc
  sshIP: string
  allowIPs?: string[]
}

export class Compute {
  public readonly Instance: Instance
  public readonly SecurityGroup: SecurityGroup

  constructor(scope: Construct, id: string, props: ComputeProps) {
    const { vpc } = props

    const instanceSecurityGroup = new SecurityGroup(
      scope,
      'SpinComputeSecurityGroup',
      {
        vpc,
        allowAllOutbound: true,
        securityGroupName: 'TunnelAndProxyGroup',
      }
    )

    instanceSecurityGroup.addIngressRule(
      Peer.ipv4(`${props.sshIP}/32`),
      Port.tcp(22),
      'SSH Ingress'
    )

    instanceSecurityGroup.addIngressRule(
      Peer.ipv4('0.0.0.0/0'),
      Port.tcp(8080),
      'Gateway Ingress'
    )

    const instance = new Instance(scope, id, {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
      machineImage: MachineImage.latestAmazonLinux2023(),
      keyPair: KeyPair.fromKeyPairName(scope, 'SpinKey', 'spinkey'),
      vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      securityGroup: instanceSecurityGroup,
      allowAllOutbound: true,
    })

    this.Instance = instance
    this.SecurityGroup = instanceSecurityGroup
  }
}
