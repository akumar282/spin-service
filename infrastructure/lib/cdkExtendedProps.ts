import { StackProps } from 'aws-cdk-lib'

export interface CdkExtendedProps extends StackProps {
  discogs_token: string
  proxy_ip: string
  opensearch_user: string
  dashpass: string
  zone_name: string
  zone_id: string
  ses_public_key: string
  ses_private_key: string
}
