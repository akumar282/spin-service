import { StackProps } from 'aws-cdk-lib'

export interface CdkExtendedProps extends StackProps {
  readonly proxy_ip: string
  readonly opensearch_user: string
  readonly dashpass: string
  readonly zone_name: string
  readonly zone_id: string
  readonly ses_public_key: string
  readonly ses_private_key: string
}
