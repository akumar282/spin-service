import { StackProps } from 'aws-cdk-lib'
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53'

export interface SpinStackProps extends StackProps {
  discogs_key: string
  discogs_secret: string
  domainEndpoint: string
  opensearch_user: string
  dashpass: string
  vpc: Vpc
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

export interface SpinClientStackProps extends StackProps {
  certificate: Certificate
  sub: string
  zone: PublicHostedZone
}

export interface CertificateStackProps extends StackProps {
  domainName: string
  zoneId: string
  zoneName: string
}
