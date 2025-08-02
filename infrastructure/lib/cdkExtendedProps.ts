import { StackProps } from 'aws-cdk-lib'
import { Api } from './apigateway/api'
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import { VpcLink } from 'aws-cdk-lib/aws-apigateway'
import { NetworkLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2'
export interface CdkExtendedProps extends StackProps {
  domainEndpoint: string
  instanceIp: string
  opensearch_user: string
  dashpass: string
  api: Api
  vpc: Vpc
  vpcLink: VpcLink
  nlb: NetworkLoadBalancer
}

export interface ComputingNetworkStackProps extends StackProps {
  opensearch_user: string
  dashpass: string
  ssh_ip: string
  zone_name: string
  zone_id: string
  ses_public_key: string
  ses_private_key: string
  discogs_token: string
  proxy_ip: string
}
