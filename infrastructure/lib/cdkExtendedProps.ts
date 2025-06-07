import { StackProps } from 'aws-cdk-lib'
import { Api } from './apigateway/api'

export interface CdkExtendedProps extends StackProps {
  opensearch_user: string
  dashpass: string
}

export interface ComputingNetworkStackProps extends StackProps {
  api: Api
  opensearch_user: string
  dashpass: string
  zone_name: string
  zone_id: string
  ses_public_key: string
  ses_private_key: string
  discogs_token: string
  proxy_ip: string
}
